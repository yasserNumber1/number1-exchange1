export const displayCurrencySymbol = (symbol) =>
  symbol === 'MGO' ? 'MNG USD' : (symbol || '')

export const displayMethodSymbol = (method) =>
  method?.type === 'moneygo'
    ? 'MNG USD'
    : displayCurrencySymbol(method?.symbol)
