import { useState } from "react";
import ConnectButton from "./components/ConnectButton";
import TokenPage from "./pages/TokenPage";
import CampaignsPage from "./pages/CampaignsPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [page, setPage] = useState("token"); // token | campaigns | admin | campaign
  const [activeCampaign, setActiveCampaign] = useState(null);

  function openCampaign(addr) {
    setActiveCampaign(addr);
    setPage("campaign");
  }

  return (
    <div>
      <div style={{ padding: 16, borderBottom: "1px solid #333", display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={() => setPage("token")}>Token</button>
        <button onClick={() => setPage("campaigns")}>Campaigns</button>
        <button onClick={() => setPage("admin")}>Admin</button>
        <div style={{ marginLeft: "auto" }}>
          <ConnectButton onConnected={setWallet} />
        </div>
      </div>

      {page === "token" && <TokenPage wallet={wallet} />}
      {page === "campaigns" && <CampaignsPage wallet={wallet} onOpenCampaign={openCampaign} />}
      {page === "admin" && <AdminPage wallet={wallet} />}

      {page === "campaign" && (
        <CampaignDetailPage
          wallet={wallet}
          campaignAddress={activeCampaign}
          onBack={() => setPage("campaigns")}
        />
      )}
    </div>
  );
}
