// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SimpleAMM is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token0;
    IERC20 public immutable token1;

    uint256 public reserve0;
    uint256 public reserve1;
    uint16 public immutable feeBps;

    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1);
    event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1, address to);
    event Swap(
        address indexed trader,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 amountOut,
        address indexed recipient
    );

    error InvalidToken();
    error InvalidAmount();
    error InsufficientOutput();
    error InsufficientLiquidity();
    error InvalidFee();

    constructor(address token0_, address token1_, uint16 feeBps_) {
        if (token0_ == token1_ || token0_ == address(0) || token1_ == address(0)) revert InvalidToken();
        if (feeBps_ >= 10_000) revert InvalidFee();

        token0 = IERC20(token0_);
        token1 = IERC20(token1_);
        feeBps = feeBps_;
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external nonReentrant {
        if (amount0 == 0 || amount1 == 0) revert InvalidAmount();

        token0.safeTransferFrom(msg.sender, address(this), amount0);
        token1.safeTransferFrom(msg.sender, address(this), amount1);

        reserve0 += amount0;
        reserve1 += amount1;

        emit LiquidityAdded(msg.sender, amount0, amount1);
    }

    function removeLiquidity(uint256 amount0, uint256 amount1, address to) external onlyOwner nonReentrant {
        if (to == address(0)) revert InvalidToken();
        if (amount0 > reserve0 || amount1 > reserve1) revert InsufficientLiquidity();

        reserve0 -= amount0;
        reserve1 -= amount1;

        if (amount0 > 0) token0.safeTransfer(to, amount0);
        if (amount1 > 0) token1.safeTransfer(to, amount1);

        emit LiquidityRemoved(msg.sender, amount0, amount1, to);
    }

    function quoteOut(address tokenIn, uint256 amountIn) public view returns (uint256 amountOut) {
        if (amountIn == 0) revert InvalidAmount();

        bool zeroForOne;
        if (tokenIn == address(token0)) {
            zeroForOne = true;
        } else if (tokenIn == address(token1)) {
            zeroForOne = false;
        } else {
            revert InvalidToken();
        }

        uint256 inReserve = zeroForOne ? reserve0 : reserve1;
        uint256 outReserve = zeroForOne ? reserve1 : reserve0;
        if (inReserve == 0 || outReserve == 0) revert InsufficientLiquidity();

        uint256 amountInAfterFee = (amountIn * (10_000 - feeBps)) / 10_000;
        amountOut = (amountInAfterFee * outReserve) / (inReserve + amountInAfterFee);
    }

    function swapExactIn(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external nonReentrant returns (uint256 amountOut) {
        if (recipient == address(0)) revert InvalidToken();
        if (amountIn == 0) revert InvalidAmount();

        amountOut = quoteOut(tokenIn, amountIn);
        if (amountOut < minAmountOut) revert InsufficientOutput();

        if (tokenIn == address(token0)) {
            token0.safeTransferFrom(msg.sender, address(this), amountIn);
            token1.safeTransfer(recipient, amountOut);
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            token1.safeTransferFrom(msg.sender, address(this), amountIn);
            token0.safeTransfer(recipient, amountOut);
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }

        emit Swap(msg.sender, tokenIn, amountIn, amountOut, recipient);
    }
}

