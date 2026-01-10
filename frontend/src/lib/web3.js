import { ethers } from "ethers";

export function hasMetaMask() {
  return typeof window !== "undefined" && !!window.ethereum;
}

export async function connectWallet() {
  if (!hasMetaMask()) throw new Error("MetaMask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  const network = await provider.getNetwork();
  const address = await signer.getAddress();

  return { provider, signer, address, chainId: Number(network.chainId) };
}

export async function getConnectedWallet() {
  if (!hasMetaMask()) return null;

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_accounts", []);
  if (!accounts?.length) return null;

  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  const address = await signer.getAddress();

  return { provider, signer, address, chainId: Number(network.chainId) };
}

export function onAccountsChanged(handler) {
  if (!hasMetaMask()) return () => {};
  window.ethereum.on("accountsChanged", handler);
  return () => window.ethereum.removeListener("accountsChanged", handler);
}

export function onChainChanged(handler) {
  if (!hasMetaMask()) return () => {};
  window.ethereum.on("chainChanged", handler);
  return () => window.ethereum.removeListener("chainChanged", handler);
}
