// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISaleToken is IERC20 {
    function buyTokens(uint256 amountWholeTokens) external payable;
    function decimals() external view returns (uint8);
}

contract SponsorFunding is Ownable {
    ISaleToken public immutable token;

    // basis points: 10_000 = 100%
    uint16 public immutable sponsorPercentBP;

    event SponsorTokensPurchased(uint256 amountWholeTokens, uint256 ethPaidWei);
    event SponsorAttempt(address indexed crowdFunding, uint256 baseAmount, uint256 bonusAmount, bool paid);

    constructor(address tokenAddress, uint16 sponsorPercentBP_) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Token required");
        require(sponsorPercentBP_ <= 10_000, "Percent > 100%");
        token = ISaleToken(tokenAddress);
        sponsorPercentBP = sponsorPercentBP_;
    }

    // Owner cumpara tokeni pentru sponsorizari (ETH-ul trebuie sa fie exact cat cere token contract)
    function buySponsorTokens(uint256 amountWholeTokens) external payable onlyOwner {
        token.buyTokens{value: msg.value}(amountWholeTokens);
        emit SponsorTokensPurchased(amountWholeTokens, msg.value);
    }

    // Se apeleaza DOAR de catre contractul CrowdFunding (msg.sender trebuie sa fie crowdFunding)
    // Daca nu sunt suficienti tokeni pentru bonus, NU trimite nimic.
    function sponsor(address crowdFunding, uint256 baseAmount) external {
        require(msg.sender == crowdFunding, "Only CrowdFunding can call");

        if (baseAmount == 0 || sponsorPercentBP == 0) {
            emit SponsorAttempt(crowdFunding, baseAmount, 0, false);
            return;
        }

        uint256 bonus = (baseAmount * sponsorPercentBP) / 10_000;
        if (bonus == 0) {
            emit SponsorAttempt(crowdFunding, baseAmount, 0, false);
            return;
        }

        if (token.balanceOf(address(this)) < bonus) {
            emit SponsorAttempt(crowdFunding, baseAmount, bonus, false);
            return;
        }

        require(token.transfer(crowdFunding, bonus), "Token transfer failed");
        emit SponsorAttempt(crowdFunding, baseAmount, bonus, true);
    }
}
