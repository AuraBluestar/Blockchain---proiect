export default function RoleGate({ allowed, fallback = null, children }) {
  if (!allowed) return fallback;
  return children;
}
