import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [owner] = await ethers.getSigners();

  const tokenAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const goal = ethers.parseUnits("1000", 18);

  const crowd = await ethers.deployContract("CrowdFunding", [tokenAddr, goal]);
  await crowd.waitForDeployment();

  console.log("CrowdFunding:", await crowd.getAddress());
  console.log("Owner:", owner.address);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
