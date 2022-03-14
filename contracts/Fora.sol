// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
* @title Implementation ERC20 token
*/
contract Fora is ERC20 {

    /**
    * @dev Creates a contract instance that allows approve and transfer token
    * @param name_ Name token
    * @param symbol_ Symbol token
    * @param amount_ Amount for mint token
    */
    constructor(string memory name_, string memory symbol_, uint256 amount_) ERC20(name_, symbol_) {
        require(amount_ > 0, "Amount is not positive");
        _mint(msg.sender, amount_ * 10 ** decimals());
    }
}
