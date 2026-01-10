import { useEffect, useMemo, useState } from "react";
import addresses from "../addresses.local.json";
import { getToken } from "../lib/contracts";
import { ethers } from "ethers";

export default function TokenPage({ wallet }) {
  const [priceWei, setPriceWei] = useState(null);
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState("10");
  const [msg, setMsg] = useState("");

  const token = useMemo(() => {
    if (!wallet?.signer) return null;
    return getToken(addresses.token, wallet.signer);
  }, [wallet]);

  async function refresh() {
    if (!token || !wallet?.address) return;
    const p = await token.tokenPriceWei();
    const b = await token.balanceOf(wallet.address);
    setPriceWei(p);
    setBalance(b);
  }

  useEffect(() => {
    refresh().catch(() => { });
  }, [token]);

  async function buy() {
    setMsg("");
    if (!priceWei) return setMsg("Price not loaded yet");
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return setMsg("Invalid amount");

    const cost = BigInt(n) * BigInt(priceWei);
    const tx = await token.buyTokens(n, { value: cost });
    await tx.wait();
    setMsg("Buy ok");
    await refresh();
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Token</h2>

      <div>Token address: <span style={{ fontFamily: "monospace" }}>{addresses.token}</span></div>
      <div>Price: {priceWei !== null ? `${ethers.formatEther(priceWei)} ETH / token` : "-"}</div>
      <div>Your token balance: {balance !== null ? ethers.formatUnits(balance, 18) : "-"}</div>

      <hr style={{ margin: "16px 0" }} />

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: 120 }} />
        <button disabled={!token || !priceWei} onClick={buy}>Buy tokens</button>
      </div>


      {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
    </div>
  );
}
