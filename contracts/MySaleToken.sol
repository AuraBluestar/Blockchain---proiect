// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MySaleToken is ERC20, Ownable {
    uint256 public tokenPriceWei; // pret pentru 1 token 

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupplyWholeTokens,
        uint256 tokenPriceWei_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        require(tokenPriceWei_ > 0, "Price must be > 0");
        tokenPriceWei = tokenPriceWei_;

        _mint(address(this), initialSupplyWholeTokens * 10 ** decimals());
    }

    function setTokenPriceWei(uint256 newPriceWei) external onlyOwner {
        require(newPriceWei > 0, "Price must be > 0");
        tokenPriceWei = newPriceWei;
    }

    // cumperi tokeni trimitand ETH
    function buyTokens(uint256 amountWholeTokens) external payable {
        require(amountWholeTokens > 0, "Amount must be > 0");

        uint256 cost = amountWholeTokens * tokenPriceWei;
        uint256 amount = amountWholeTokens * 10 ** decimals();

        require(msg.value == cost, "Incorrect ETH sent");
        require(balanceOf(address(this)) >= amount, "Not enough tokens");

        _transfer(address(this), msg.sender, amount);
    }

    function withdrawETH(address payable to, uint256 amountWei) external onlyOwner {
        require(address(this).balance >= amountWei, "Insufficient ETH");
        to.transfer(amountWei);
    }
}
