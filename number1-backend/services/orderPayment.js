const paymentIsOpen = (order, now = new Date()) =>
  ["pending", "verifying"].includes(order.status) &&
  (order.status !== "pending" || (order.expiresAt && new Date(order.expiresAt) > now));

const cancellationSource = (order) => {
  if (order.cancelledBy) return order.cancelledBy;
  const event = [...(order.timeline || [])].reverse().find((entry) => entry.status === "cancelled");
  if (event?.by === "customer") return "customer";
  if (event?.by?.startsWith("admin:")) return "admin";
  return null;
};

const createPaymentDestination = (method, paymentMethod) => {
  if (method.type === "wallet") return null;
  const network = method.network || (paymentMethod === "USDT_BEP20" ? "BEP20" : paymentMethod === "USDT_TRC20" ? "TRC20" : "");
  const networkAddress = method.networks?.find((item) => item.networkKey === network && item.enabled !== false)?.address;
  return {
    methodName: method.name,
    address: (networkAddress || method.receiverNumber || "").trim(),
    network,
    type: method.type,
  };
};

module.exports = { paymentIsOpen, cancellationSource, createPaymentDestination };
