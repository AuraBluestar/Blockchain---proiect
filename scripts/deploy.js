// import { network } from "hardhat";

// async function main() {
//   const { ethers } = await network.connect();

//   console.log("DEPLOY START");

//   const [deployer] = await ethers.getSigners();
//   console.log("Deployer:", deployer.address);

//   const token = await ethers.deployContract("MySaleToken", [
//     "Crowd Token",
//     "CRWD",
//     1_000_000,
//     ethers.parseEther("0.001"),
//   ]);
//   await token.waitForDeployment();
//   console.log("MySaleToken:", await token.getAddress());

//   const sponsor = await ethers.deployContract("SponsorFunding", [
//     await token.getAddress(),
//     1_000, // 10%
//   ]);
//   await sponsor.waitForDeployment();
//   console.log("SponsorFunding:", await sponsor.getAddress());

//   const distribute = await ethers.deployContract("DistributeFunding", [
//     await token.getAddress(),
//   ]);
//   await distribute.waitForDeployment();
//   console.log("DistributeFunding:", await distribute.getAddress());

//   const crowd = await ethers.deployContract("CrowdFunding", [
//     await token.getAddress(),
//     ethers.parseUnits("1000", 18),
//   ]);
//   await crowd.waitForDeployment();
//   console.log("CrowdFunding:", await crowd.getAddress());

//   console.log("DEPLOY END");
// }

// main().catch((err) => {
//   console.error(err);
//   process.exitCode = 1;
// });
