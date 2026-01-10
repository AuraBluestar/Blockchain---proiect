export default function CampaignCard({ address, state, goal, collected, onOpen, onRemove }) {
  return (
    <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, marginBottom: 10 }}>
      <div style={{ fontFamily: "monospace" }}>{address}</div>
      <div>State: {state}</div>
      <div>Goal: {goal}</div>
      <div>Collected: {collected}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={onOpen}>Open</button>
        <button onClick={onRemove}>Remove</button>
      </div>
    </div>
  );
}
