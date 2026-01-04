// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DistributeFunding is Ownable, ReentrancyGuard {
    IERC20 public immutable token;

    // contractul (CrowdFunding) care are voie sa confirme primirea fondurilor
    address public fundingSource;

    struct Shareholder {
        uint16 weightBP; // din 10_000 (100%)
        bool exists;
        bool claimed;
    }

    mapping(address => Shareholder) public shareholders;
    address[] public shareholderList;

    uint16 public totalWeightBP;

    bool public fundingReceived;
    uint256 public totalReceivedSnapshot;

    event FundingSourceSet(address indexed source);
    event ShareholderAdded(address indexed who, uint16 weightBP);
    event FundingReceived(uint256 totalAmount);
    event Claimed(address indexed who, uint256 amount);
    event RemainderWithdrawn(address indexed to, uint256 amount);

    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Token required");
        token = IERC20(tokenAddress);
    }

    // setezi o singura data (inainte de primirea fondurilor) contractul CrowdFunding
    function setFundingSource(address source) external onlyOwner {
        require(!fundingReceived, "Already funded");
        require(source != address(0), "Invalid source");
        fundingSource = source;
        emit FundingSourceSet(source);
    }

    function addShareholder(address who, uint16 weightBP) external onlyOwner {
        require(!fundingReceived, "Cannot add after funding received");
        require(who != address(0), "Invalid address");
        require(weightBP > 0, "Weight must be > 0");
        require(!shareholders[who].exists, "Already added");

        uint16 newTotal = totalWeightBP + weightBP;
        require(newTotal <= 10_000, "Total weight > 100%");

        shareholders[who] = Shareholder({
            weightBP: weightBP,
            exists: true,
            claimed: false
        });
        shareholderList.push(who);
        totalWeightBP = newTotal;

        emit ShareholderAdded(who, weightBP);
    }

    // se apeleaza DOAR de CrowdFunding (fundingSource), dupa ce tokenii au fost transferati aici
    function notifyFundingReceived() external {
        require(!fundingReceived, "Already notified");
        require(msg.sender == fundingSource, "Only funding source");

        uint256 bal = token.balanceOf(address(this));
        require(bal > 0, "No tokens received");

        fundingReceived = true;
        totalReceivedSnapshot = bal;

        emit FundingReceived(bal);
    }

    function claim() external nonReentrant {
        require(fundingReceived, "Funding not received");

        Shareholder storage sh = shareholders[msg.sender];
        require(sh.exists, "Not a shareholder");
        require(!sh.claimed, "Already claimed");

        sh.claimed = true;

        uint256 amount = (totalReceivedSnapshot * sh.weightBP) / 10_000;

        if (amount > 0) {
            require(token.transfer(msg.sender, amount), "Token transfer failed");
        }

        emit Claimed(msg.sender, amount);
    }

    // optional: owner retrage restul ramas (daca totalWeightBP < 100% sau rotunjiri)
    function withdrawRemainder(address to) external onlyOwner {
        require(fundingReceived, "Funding not received");
        require(to != address(0), "Invalid to");

        uint256 bal = token.balanceOf(address(this));
        require(bal > 0, "No remainder");

        require(token.transfer(to, bal), "Token transfer failed");
        emit RemainderWithdrawn(to, bal);
    }

    function getShareholdersCount() external view returns (uint256) {
        return shareholderList.length;
    }
}
