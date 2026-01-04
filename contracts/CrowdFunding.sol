// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISponsorFunding {
    function sponsor(address crowdFunding, uint256 baseAmount) external;
}

interface IDistributeFunding {
    function notifyFundingReceived() external;
}

contract CrowdFunding is Ownable, ReentrancyGuard {
    IERC20 public immutable token;
    uint256 public immutable fundingGoal; // in smallest token units

    enum FundingState { NEFINANTAT, PREFINANTAT, FINANTAT }
    FundingState public state;

    mapping(address => uint256) public contributions;
    uint256 public totalCollected;

    bool public sponsorRequested;
    bool public distributed;

    event Deposited(address indexed contributor, uint256 amount, uint256 totalCollected);
    event Withdrawn(address indexed contributor, uint256 amount, uint256 totalCollected);
    event GoalReached(uint256 totalCollected);
    event SponsorFinalized(address sponsorFunding);
    event Distributed(address distributeFunding, uint256 amount);

    constructor(address tokenAddress, uint256 fundingGoal_) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Token required");
        require(fundingGoal_ > 0, "Goal must be > 0");
        token = IERC20(tokenAddress);
        fundingGoal = fundingGoal_;
        state = FundingState.NEFINANTAT;
    }

    function getFundingStateString() external view returns (string memory) {
        if (state == FundingState.NEFINANTAT) return "nefinantat";
        if (state == FundingState.PREFINANTAT) return "prefinantat";
        return "finantat";
    }

    // contributor trebuie sa faca approve inainte: token.approve(crowd, amount)
    function deposit(uint256 amount) external nonReentrant {
        require(state == FundingState.NEFINANTAT, "Deposits disabled");
        require(amount > 0, "Amount must be > 0");

        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom failed");

        contributions[msg.sender] += amount;
        totalCollected += amount;

        emit Deposited(msg.sender, amount, totalCollected);

        if (totalCollected >= fundingGoal) {
            state = FundingState.PREFINANTAT;
            emit GoalReached(totalCollected);
        }
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(state == FundingState.NEFINANTAT, "Withdrawals disabled");
        require(amount > 0, "Amount must be > 0");
        require(contributions[msg.sender] >= amount, "Insufficient contribution");

        contributions[msg.sender] -= amount;
        totalCollected -= amount;

        require(token.transfer(msg.sender, amount), "transfer failed");

        emit Withdrawn(msg.sender, amount, totalCollected);
    }

    // doar owner dupa goal: anunta SponsorFunding sa incerce sponsorizarea
    function finalizeAndRequestSponsor(address sponsorFunding) external onlyOwner {
        require(state == FundingState.PREFINANTAT, "Not prefunded");
        require(!sponsorRequested, "Already requested");
        require(sponsorFunding != address(0), "Invalid sponsor");

        sponsorRequested = true;

        ISponsorFunding(sponsorFunding).sponsor(address(this), totalCollected);

        // dupa eventuala sponsorizare => finantat (indiferent daca sponsorul a trimis 0)
        state = FundingState.FINANTAT;

        emit SponsorFinalized(sponsorFunding);
    }

    // dupa sponsorizare: muta tot la DistributeFunding
    function transferToDistribute(address distributeFunding) external onlyOwner nonReentrant {
        require(state == FundingState.FINANTAT, "Not funded");
        require(!distributed, "Already distributed");
        require(distributeFunding != address(0), "Invalid distribute");

        distributed = true;

        uint256 bal = token.balanceOf(address(this));
        require(bal > 0, "No tokens");

        require(token.transfer(distributeFunding, bal), "transfer failed");
        IDistributeFunding(distributeFunding).notifyFundingReceived();

        emit Distributed(distributeFunding, bal);
    }
}
