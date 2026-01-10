import { useMemo, useState } from "react";
import { ethers } from "ethers";
import addresses from "../addresses.local.json";
import { getDistributeFunding } from "../lib/contracts";

export default function AdminPage({ wallet }) {
  const [crowdAddr, setCrowdAddr] = useState("");
  const [shAddr, setShAddr] = useState("");
  const [weight, setWeight] = useState("1000");
  const [msg, setMsg] = useState("");

  const dist = useMemo(() => {
    if (!wallet?.signer) return null;
    return getDistributeFunding(addresses.distributeFunding, wallet.signer);
  }, [wallet]);

  async function setSource() {
    setMsg("");
    if (!ethers.isAddress(crowdAddr)) return setMsg("Invalid crowd address");
    await (await dist.setFundingSource(crowdAddr)).wait();
    setMsg("Funding source set");
  }

  async function addShareholder() {
    setMsg("");
    if (!ethers.isAddress(shAddr)) return setMsg("Invalid shareholder address");
    const w = Number(weight);
    if (!Number.isFinite(w) || w <= 0 || w > 10000) return setMsg("Invalid weight");
    await (await dist.addShareholder(shAddr, w)).wait();
    setMsg("Shareholder added");
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin (DistributeFunding owner)</h2>
      <div>DistributeFunding: <span style={{ fontFamily: "monospace" }}>{addresses.distributeFunding}</span></div>

      <hr style={{ margin: "16px 0" }} />

      <h3>Set funding source (CrowdFunding address)</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={crowdAddr} onChange={(e) => setCrowdAddr(e.target.value)} style={{ width: 420 }} />
        <button onClick={setSource} disabled={!dist}>Set</button>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h3>Add shareholder</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input placeholder="address" value={shAddr} onChange={(e) => setShAddr(e.target.value)} style={{ width: 420 }} />
        <input placeholder="weightBP" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ width: 100 }} />
        <button onClick={addShareholder} disabled={!dist}>Add</button>
      </div>

      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
    </div>
  );
}
