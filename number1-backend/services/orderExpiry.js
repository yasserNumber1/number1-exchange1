const DEFAULT_ORDER_EXPIRY_MINS = 30;
const MAX_DATE_MS = 8.64e15;

function parseOrderExpiryMins(value) {
  const minutes = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (!Number.isSafeInteger(minutes) || minutes < 1 || Date.now() + minutes * 60_000 > MAX_DATE_MS) {
    return null;
  }
  return minutes;
}

function getOrderExpiresAt(settings, now = Date.now()) {
  const minutes = parseOrderExpiryMins(settings?.orderExpiryMins) ?? DEFAULT_ORDER_EXPIRY_MINS;
  return new Date(now + minutes * 60_000);
}

module.exports = { parseOrderExpiryMins, getOrderExpiresAt };
