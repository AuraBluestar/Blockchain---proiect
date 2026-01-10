import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { getCrowdFunding } from "../lib/contracts";
import CampaignCard from "../components/CampaignCard";

const LS_KEY = "campaign_addresses_v1";

function loadCampaigns() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCampaigns(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export default function CampaignsPage({ wallet, onOpenCampaign }) {
  const [inputAddr, setInputAddr] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [meta, setMeta] = useState({}); // addr -> {state, goal, collected}

  const provider = wallet?.provider;

  useEffect(() => {
    setCampaigns(loadCampaigns());
  }, []);

  async function refreshOne(addr) {
    if (!provider) return;
    const crowd = getCrowdFunding(addr, provider);
    const state = await crowd.getFundingStateString();
    const goal = await crowd.fundingGoal();
    const collected = await crowd.totalCollected();
    return {
      state,
      goal: ethers.formatUnits(goal, 18),
      collected: ethers.formatUnits(collected, 18),
    };
  }

  useEffect(() => {
    (async () => {
      if (!provider) return;
      const out = {};
      for (const addr of campaigns) {
        try {
          out[addr] = await refreshOne(addr);
        } catch {
          out[addr] = { state: "unknown", goal: "?", collected: "?" };
        }
      }
      setMeta(out);
    })();
  }, [provider, campaigns]);

  function addCampaign() {
    const addr = inputAddr.trim();
    if (!ethers.isAddress(addr)) return;

    const next = Array.from(new Set([...campaigns, addr]));
    setCampaigns(next);
    saveCampaigns(next);
    setInputAddr("");
  }

  function removeCampaign(addr) {
    const next = campaigns.filter((a) => a !== addr);
    setCampaigns(next);
    saveCampaigns(next);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Campaigns</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          placeholder="CrowdFunding address"
          value={inputAddr}
          onChange={(e) => setInputAddr(e.target.value)}
          style={{ width: 420 }}
        />
        <button onClick={addCampaign}>Add</button>
      </div>

      <div style={{ marginTop: 16 }}>
        {campaigns.length === 0 && <div>No campaigns yet.</div>}

        {campaigns.map((addr) => (
          <CampaignCard
            key={addr}
            address={addr}
            state={meta[addr]?.state ?? "-"}
            goal={meta[addr]?.goal ?? "-"}
            collected={meta[addr]?.collected ?? "-"}
            onOpen={() => onOpenCampaign(addr)}
            onRemove={() => removeCampaign(addr)}
          />
        ))}
      </div>
    </div>
  );
}
