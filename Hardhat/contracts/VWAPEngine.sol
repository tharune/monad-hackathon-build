// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ISimpleAMM {
    function token0() external view returns (IERC20);
    function token1() external view returns (IERC20);
    function quoteOut(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut);
    function swapExactIn(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external returns (uint256 amountOut);
}

contract VWAPEngine is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Order {
        address owner;
        address recipient;
        address tokenIn;
        address tokenOut;
        uint256 totalAmountIn;
        uint256 remainingAmountIn;
        uint8 numSlices;
        uint8 executedSlices;
        uint16 maxSlippageBps;
        uint16 maxImpactBps;
        uint64 intervalSec;
        uint64 nextExecutionTime;
        uint64 deadline;
        bool active;
    }

    ISimpleAMM public immutable amm;
    uint256 public nextOrderId = 1;
    mapping(uint256 => Order) public orders;

    event OrderCreated(
        uint256 indexed orderId,
        address indexed owner,
        address indexed recipient,
        address tokenIn,
        address tokenOut,
        uint256 totalAmountIn,
        uint8 numSlices,
        uint64 intervalSec
    );
    event SliceExecuted(
        uint256 indexed orderId,
        uint8 indexed sliceNumber,
        uint256 amountIn,
        uint256 amountOut,
        address indexed executor
    );
    event OrderCancelled(uint256 indexed orderId, uint256 refundedAmount);
    event OrderCompleted(uint256 indexed orderId, uint256 totalAmountOut);
    event RiskCheckFailed(uint256 indexed orderId, string reason);

    error InvalidPair();
    error InvalidRecipient();
    error InvalidSlices();
    error InvalidAmount();
    error InvalidSlippage();
    error InvalidImpact();
    error InvalidOrder();
    error Unauthorized();
    error OrderInactive();
    error TooEarly();
    error OrderExpired();
    error NothingToExecute();
    error NothingToRefund();
    error ImpactTooHigh();

    constructor(address ammAddress) {
        if (ammAddress == address(0)) revert InvalidPair();
        amm = ISimpleAMM(ammAddress);
    }

    function createOrder(
        address tokenIn,
        address tokenOut,
        uint256 totalAmountIn,
        uint8 numSlices,
        uint64 intervalSec,
        uint16 maxSlippageBps,
        uint16 maxImpactBps,
        uint64 deadline,
        address recipient
    ) external nonReentrant returns (uint256 orderId) {
        if (recipient == address(0)) revert InvalidRecipient();
        if (totalAmountIn == 0) revert InvalidAmount();
        if (numSlices == 0 || numSlices > 20) revert InvalidSlices();
        if (maxSlippageBps == 0 || maxSlippageBps > 5_000) revert InvalidSlippage();
        if (maxImpactBps > 5_000) revert InvalidImpact();
        if (deadline <= block.timestamp) revert OrderExpired();

        bool validForward = tokenIn == address(amm.token0()) && tokenOut == address(amm.token1());
        bool validReverse = tokenIn == address(amm.token1()) && tokenOut == address(amm.token0());
        if (!validForward && !validReverse) revert InvalidPair();

        orderId = nextOrderId;
        nextOrderId++;

        orders[orderId] = Order({
            owner: msg.sender,
            recipient: recipient,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            totalAmountIn: totalAmountIn,
            remainingAmountIn: totalAmountIn,
            numSlices: numSlices,
            executedSlices: 0,
            maxSlippageBps: maxSlippageBps,
            maxImpactBps: maxImpactBps,
            intervalSec: intervalSec,
            nextExecutionTime: uint64(block.timestamp),
            deadline: deadline,
            active: true
        });

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), totalAmountIn);

        emit OrderCreated(
            orderId,
            msg.sender,
            recipient,
            tokenIn,
            tokenOut,
            totalAmountIn,
            numSlices,
            intervalSec
        );
    }

    function executeSlice(uint256 orderId, uint256 keeperMinOut) external nonReentrant returns (uint256 amountOut) {
        Order storage order = orders[orderId];
        if (order.owner == address(0)) revert InvalidOrder();
        if (!order.active) revert OrderInactive();
        if (block.timestamp < order.nextExecutionTime) revert TooEarly();
        if (block.timestamp > order.deadline) revert OrderExpired();
        if (order.remainingAmountIn == 0 || order.executedSlices >= order.numSlices) revert NothingToExecute();

        uint256 amountIn = _nextSliceAmount(order);
        uint256 quotedOut = amm.quoteOut(order.tokenIn, amountIn);
        if (quotedOut == 0) revert InvalidAmount();

        if (order.maxImpactBps > 0) {
            uint8 inDecimals = IERC20Metadata(order.tokenIn).decimals();
            uint256 tinyIn = 10 ** inDecimals;
            uint256 tinyQuote = amm.quoteOut(order.tokenIn, tinyIn);
            if (tinyQuote > 0) {
                uint256 linearOut = (tinyQuote * amountIn) / tinyIn;
                if (linearOut > quotedOut) {
                    uint256 impactBps = ((linearOut - quotedOut) * 10_000) / linearOut;
                    if (impactBps > order.maxImpactBps) {
                        emit RiskCheckFailed(orderId, "MAX_IMPACT_BPS");
                        revert ImpactTooHigh();
                    }
                }
            }
        }

        uint256 minOutFromSlippage = (quotedOut * (10_000 - order.maxSlippageBps)) / 10_000;
        uint256 minOut = keeperMinOut > minOutFromSlippage ? keeperMinOut : minOutFromSlippage;

        IERC20 tokenIn = IERC20(order.tokenIn);
        tokenIn.safeApprove(address(amm), 0);
        tokenIn.safeApprove(address(amm), amountIn);
        amountOut = amm.swapExactIn(order.tokenIn, amountIn, minOut, order.recipient);

        order.remainingAmountIn -= amountIn;
        order.executedSlices += 1;
        order.nextExecutionTime = uint64(block.timestamp + order.intervalSec);

        emit SliceExecuted(orderId, order.executedSlices, amountIn, amountOut, msg.sender);

        if (order.executedSlices >= order.numSlices || order.remainingAmountIn == 0) {
            order.active = false;
            emit OrderCompleted(orderId, amountOut);
        }
    }

    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        if (order.owner == address(0)) revert InvalidOrder();
        if (msg.sender != order.owner) revert Unauthorized();
        if (!order.active) revert OrderInactive();

        uint256 refundAmount = order.remainingAmountIn;
        if (refundAmount == 0) revert NothingToRefund();

        order.active = false;
        order.remainingAmountIn = 0;
        IERC20(order.tokenIn).safeTransfer(order.owner, refundAmount);

        emit OrderCancelled(orderId, refundAmount);
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function estimateNextSliceAmount(uint256 orderId) external view returns (uint256) {
        Order memory order = orders[orderId];
        if (order.owner == address(0) || !order.active) return 0;
        return _nextSliceAmount(order);
    }

    function _nextSliceAmount(Order memory order) private pure returns (uint256) {
        uint256 slicesLeft = uint256(order.numSlices) - uint256(order.executedSlices);
        if (slicesLeft == 0) return 0;
        if (slicesLeft == 1) return order.remainingAmountIn;
        return order.remainingAmountIn / slicesLeft;
    }
}

