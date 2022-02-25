// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Fora is ERC20 {

    constructor(string memory name_, string memory symbol_, uint256 amount_) ERC20(name_, symbol_) {
        require(amount_ > 0, "Amount is not positive");
        _mint(msg.sender, amount_ * 10 ** decimals());
    }
}
