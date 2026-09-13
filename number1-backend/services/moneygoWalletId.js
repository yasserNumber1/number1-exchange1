function isValidMoneyGoWalletId(value) {
  return typeof value === 'string' && /^U-\S+$/.test(value.trim());
}

module.exports = { isValidMoneyGoWalletId };
