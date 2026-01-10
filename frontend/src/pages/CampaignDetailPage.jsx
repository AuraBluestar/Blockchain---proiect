import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import addresses from "../addresses.local.json";
import { getCrowdFunding, getDistributeFunding, getToken } from "../lib/contracts";
import RoleGate from "../components/RoleGate";

export default function CampaignDetailPage({ wallet, campaignAddress, onBack }) {
  const [info, setInfo] = useState(null);
  const [depositAmt, setDepositAmt] = useState("10");
  const [withdrawAmt, setWithdrawAmt] = useState("5");
  const [msg, setMsg] = useState("");

  const crowd = useMemo(() => {
    if (!wallet?.signer || !campaignAddress) return null;
    return getCrowdFunding(campaignAddress, wallet.signer);
  }, [wallet, campaignAddress]);

  const crowdRead = useMemo(() => {
    if (!wallet?.provider || !campaignAddress) return null;
    return getCrowdFunding(campaignAddress, wallet.provider);
  }, [wallet, campaignAddress]);

  const token = useMemo(() => {
    if (!wallet?.signer) return null;
    return getToken(addresses.token, wallet.signer);
  }, [wallet]);

  const distribute = useMemo(() => {
    if (!wallet?.signer) return null;
    return getDistributeFunding(addresses.distributeFunding, wallet.signer);
  }, [wallet]);

  async function refresh() {
    if (!crowdRead || !wallet?.address) return;

    const state = await crowdRead.getFundingStateString();
    const goal = await crowdRead.fundingGoal();
    const collected = await crowdRead.totalCollected();
    const owner = await crowdRead.owner();
    const myContrib = await crowdRead.contributions(wallet.address);

    const distOwner = await getDistributeFunding(addresses.distributeFunding, wallet.provider).owner();
    const sh = await getDistributeFunding(addresses.distributeFunding, wallet.provider).shareholders(wallet.address);

    setInfo({
      state,
      goal: ethers.formatUnits(goal, 18),
      collected: ethers.formatUnits(collected, 18),
      crowdOwner: owner,
      isCrowdOwner: owner.toLowerCase() === wallet.address.toLowerCase(),
      myContrib: ethers.formatUnits(myContrib, 18),
      distOwner,
      isDistOwner: distOwner.toLowerCase() === wallet.address.toLowerCase(),
      isShareholder: sh?.exists ?? false,
      claimed: sh?.claimed ?? false,
      weightBP: sh?.weightBP?.toString?.() ?? "0",
    });
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, [crowdRead, wallet?.address]);

  async function approveAndDeposit() {
    setMsg("");
    const n = Number(depositAmt);
    if (!Number.isFinite(n) || n <= 0) return setMsg("Invalid amount");
    const amt = ethers.parseUnits(String(n), 18);

    // approve then deposit
    await (await token.approve(campaignAddress, amt)).wait();
    await (await crowd.deposit(amt)).wait();

    setMsg("Deposit ok");
    await refresh();
  }

  async function withdraw() {
    setMsg("");
    const n = Number(withdrawAmt);
    if (!Number.isFinite(n) || n <= 0) return setMsg("Invalid amount");
    const amt = ethers.parseUnits(String(n), 18);

    await (await crowd.withdraw(amt)).wait();
    setMsg("Withdraw ok");
    await refresh();
  }

  async function finalizeSponsor() {
    setMsg("");
    await (await crowd.finalizeAndRequestSponsor(addresses.sponsorFunding)).wait();
    setMsg("Finalize sponsor ok");
    await refresh();
  }

  async function transferToDistribute() {
    setMsg("");
    await (await crowd.transferToDistribute(addresses.distributeFunding)).wait();
    setMsg("Transfer to distribute ok");
    await refresh();
  }

  async function claim() {
    setMsg("");
    await (await distribute.claim()).wait();
    setMsg("Claim ok");
    await refresh();
  }

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack}>Back</button>
      <h2>Campaign</h2>
      <div style={{ fontFamily: "monospace" }}>{campaignAddress}</div>

      {!info ? (
        <div>Loading...</div>
      ) : (
        <>
          <div style={{ marginTop: 12 }}>
            <div>State: <b>{info.state}</b></div>
            <div>Goal: {info.goal}</div>
            <div>Collected: {info.collected}</div>
            <div>My contribution: {info.myContrib}</div>
          </div>

          <hr style={{ margin: "16px 0" }} />

          {/* NEFINANTAT actions */}
          <RoleGate
            allowed={info.state === "nefinantat"}
            fallback={<div>Deposits/withdrawals disabled in this state.</div>}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <input value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)} style={{ width: 120 }} />
              <button onClick={approveAndDeposit}>Approve + Deposit</button>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value)} style={{ width: 120 }} />
              <button onClick={withdraw}>Withdraw</button>
            </div>
          </RoleGate>

          <hr style={{ margin: "16px 0" }} />

          {/* PREFINANTAT: only crowd owner */}
          <RoleGate
            allowed={info.state === "prefinantat" && info.isCrowdOwner}
            fallback={<div>Finalize sponsor: only campaign owner and only in prefinantat.</div>}
          >
            <button onClick={finalizeSponsor}>Finalize & Request Sponsor</button>
          </RoleGate>

          <hr style={{ margin: "16px 0" }} />

          {/* FINANTAT: transfer to distribute (only crowd owner) */}
          <RoleGate
            allowed={info.state === "finantat" && info.isCrowdOwner}
            fallback={<div>Transfer to distribute: only campaign owner and only in finantat.</div>}
          >
            <button onClick={transferToDistribute}>Transfer To Distribute</button>
          </RoleGate>

          <hr style={{ margin: "16px 0" }} />

          {/* Claim */}
          <div>
            <div>Shareholder: {String(info.isShareholder)} | weightBP: {info.weightBP} | claimed: {String(info.claimed)}</div>
            <RoleGate
              allowed={info.isShareholder && !info.claimed}
              fallback={<div>Claim: available only if you are shareholder and not claimed.</div>}
            >
              <button onClick={claim}>Claim</button>
            </RoleGate>
          </div>
        </>
      )}

      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
    </div>
  );
}
