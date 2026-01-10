import { useEffect, useState } from "react";
import { connectWallet, getConnectedWallet, onAccountsChanged, onChainChanged } from "../lib/web3";

export default function ConnectButton({ onConnected }) {
  const [addr, setAddr] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let offAcc = () => {};
    let offChain = () => {};

    (async () => {
      const w = await getConnectedWallet();
      if (w) {
        setAddr(w.address);
        setChainId(w.chainId);
        onConnected?.(w);
      }
    })();

    offAcc = onAccountsChanged(async () => {
      const w = await getConnectedWallet();
      setAddr(w?.address ?? null);
      setChainId(w?.chainId ?? null);
      if (w) onConnected?.(w);
    });

    offChain = onChainChanged(async () => {
      const w = await getConnectedWallet();
      setAddr(w?.address ?? null);
      setChainId(w?.chainId ?? null);
      if (w) onConnected?.(w);
    });

    return () => {
      offAcc();
      offChain();
    };
  }, [onConnected]);

  async function handleConnect() {
    setError("");
    try {
      const w = await connectWallet();
      setAddr(w.address);
      setChainId(w.chainId);
      onConnected?.(w);
    } catch (e) {
      setError(e?.message ?? "Connect failed");
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {addr ? (
        <>
          <span style={{ fontFamily: "monospace" }}>
            {addr}
          </span>
          <span>chainId: {chainId}</span>
        </>
      ) : (
        <button onClick={handleConnect}>Connect MetaMask</button>
      )}
      {error && <span style={{ color: "crimson" }}>{error}</span>}
    </div>
  );
}
