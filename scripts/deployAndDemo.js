import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [owner, alice, bob] = await ethers.getSigners();

 
  const token = await ethers.deployContract("MySaleToken", [
    "Crowd Token",
    "CRWD",
    1_000_000,
    ethers.parseEther("0.001"),
  ]);
  await token.waitForDeployment();

  const sponsor = await ethers.deployContract("SponsorFunding", [
    await token.getAddress(),
    1_000, 
  ]);
  await sponsor.waitForDeployment();

  const distribute = await ethers.deployContract("DistributeFunding", [
    await token.getAddress(),
  ]);
  await distribute.waitForDeployment();

  const crowd = await ethers.deployContract("CrowdFunding", [
    await token.getAddress(),
    ethers.parseUnits("1000", 18),
  ]);
  await crowd.waitForDeployment();

  console.log("Token:", await token.getAddress());
  console.log("SponsorFunding:", await sponsor.getAddress());
  console.log("DistributeFunding:", await distribute.getAddress());
  console.log("CrowdFunding:", await crowd.getAddress());

  await (await distribute.connect(owner).setFundingSource(await crowd.getAddress())).wait();

  
  await (await distribute.connect(owner).addShareholder(alice.address, 6000)).wait();
  await (await distribute.connect(owner).addShareholder(bob.address, 3000)).wait();
  console.log("Shareholders added");

  
  await (await token.connect(alice).buyTokens(600, { value: ethers.parseEther("0.6") })).wait();
  await (await token.connect(bob).buyTokens(400, { value: ethers.parseEther("0.4") })).wait();
  console.log("Contributors bought tokens");

 
  await (await sponsor.connect(owner).buySponsorTokens(200, { value: ethers.parseEther("0.2") })).wait();
  console.log("Sponsor bought tokens");

  
  await (await token.connect(alice).approve(await crowd.getAddress(), ethers.parseUnits("600", 18))).wait();
  await (await crowd.connect(alice).deposit(ethers.parseUnits("600", 18))).wait();

  await (await token.connect(bob).approve(await crowd.getAddress(), ethers.parseUnits("400", 18))).wait();
  await (await crowd.connect(bob).deposit(ethers.parseUnits("400", 18))).wait();

  console.log("Deposits done. State:", await crowd.getFundingStateString());

  
  await (await crowd.connect(owner).finalizeAndRequestSponsor(await sponsor.getAddress())).wait();
  console.log("After sponsor. State:", await crowd.getFundingStateString());

  
  await (await crowd.connect(owner).transferToDistribute(await distribute.getAddress())).wait();
  console.log("Transferred. fundingReceived:", await distribute.fundingReceived());

  
  const balAliceBefore = await token.balanceOf(alice.address);
  const balBobBefore = await token.balanceOf(bob.address);

  await (await distribute.connect(alice).claim()).wait();
  await (await distribute.connect(bob).claim()).wait();

  const balAliceAfter = await token.balanceOf(alice.address);
  const balBobAfter = await token.balanceOf(bob.address);

  console.log("Alice gained:", ethers.formatUnits(balAliceAfter - balAliceBefore, 18), "tokens");
  console.log("Bob gained:", ethers.formatUnits(balBobAfter - balBobBefore, 18), "tokens");

  console.log("DONE");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
