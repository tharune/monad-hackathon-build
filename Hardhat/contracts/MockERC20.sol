// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private immutable _tokenDecimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address initialRecipient,
        uint256 initialSupply
    ) ERC20(name_, symbol_) {
        _tokenDecimals = decimals_;
        if (initialSupply > 0) {
            _mint(initialRecipient, initialSupply);
        }
    }

    function decimals() public view override returns (uint8) {
        return _tokenDecimals;
    }

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

