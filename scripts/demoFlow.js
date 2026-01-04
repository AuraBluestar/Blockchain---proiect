import { network } from "hardhat";

const ADDR = {
  token: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  sponsor: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  distribute: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  crowd: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
};

async function main() {
  const { ethers } = await network.connect();

  const [owner, alice, bob] = await ethers.getSigners();

  const token = await ethers.getContractAt("MySaleToken", ADDR.token);
  const sponsor = await ethers.getContractAt("SponsorFunding", ADDR.sponsor);
  const distribute = await ethers.getContractAt("DistributeFunding", ADDR.distribute);
  const crowd = await ethers.getContractAt("CrowdFunding", ADDR.crowd);

  console.log("Owner:", owner.address);
  console.log("Alice:", alice.address);
  console.log("Bob:", bob.address);

  // 1) Setup actionari (inainte de fundingReceived)
  // Exemplu: Alice 60%, Bob 30% (total 90%, rest ramane in contract)
  await (await distribute.connect(owner).addShareholder(alice.address, 6000)).wait();
  await (await distribute.connect(owner).addShareholder(bob.address, 3000)).wait();
  console.log("Shareholders added");

  // 2) Cumpara tokeni contributori (pret: 0.001 ETH / token)
  // Alice cumpara 600 tokeni, Bob cumpara 400 tokeni => goal 1000
  await (await token.connect(alice).buyTokens(600, { value: ethers.parseEther("0.6") })).wait();
  await (await token.connect(bob).buyTokens(400, { value: ethers.parseEther("0.4") })).wait();
  console.log("Contributors bought tokens");

  // 3) Sponsor cumpara tokeni pentru bonus (10% din 1000 = 100 tokeni)
  await (await sponsor.connect(owner).buySponsorTokens(200, { value: ethers.parseEther("0.2") })).wait();
  console.log("Sponsor bought tokens");

  // 4) Approve + deposit
  await (await token.connect(alice).approve(ADDR.crowd, ethers.parseUnits("600", 18))).wait();
  await (await crowd.connect(alice).deposit(ethers.parseUnits("600", 18))).wait();

  await (await token.connect(bob).approve(ADDR.crowd, ethers.parseUnits("400", 18))).wait();
  await (await crowd.connect(bob).deposit(ethers.parseUnits("400", 18))).wait();

  console.log("Deposits done. State:", await crowd.getFundingStateString());

  // 5) Finalizeaza si cere sponsor (owner CrowdFunding)
  await (await crowd.connect(owner).finalizeAndRequestSponsor(ADDR.sponsor)).wait();
  console.log("After sponsor. State:", await crowd.getFundingStateString());

  // 6) Transfer catre Distribute + notify
  await (await crowd.connect(owner).transferToDistribute(ADDR.distribute)).wait();
  console.log("Transferred to Distribute. fundingReceived:", await distribute.fundingReceived());

  // 7) Claim
  const balAliceBefore = await token.balanceOf(alice.address);
  const balBobBefore = await token.balanceOf(bob.address);

  await (await distribute.connect(alice).claim()).wait();
  await (await distribute.connect(bob).claim()).wait();

  const balAliceAfter = await token.balanceOf(alice.address);
  const balBobAfter = await token.balanceOf(bob.address);

  console.log("Alice gained:", ethers.formatUnits(balAliceAfter - balAliceBefore, 18), "tokens");
  console.log("Bob gained:", ethers.formatUnits(balBobAfter - balBobBefore, 18), "tokens");

  console.log("Demo flow finished");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
