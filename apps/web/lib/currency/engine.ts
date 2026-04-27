/**
 * Currency engine (A61) — convert + format.
 * USD, INR, NPR + major currencies. Swap for live FX API in prod.
 */
export type SupportedCurrency = 'USD' | 'INR' | 'NPR' | 'EUR' | 'GBP' | 'AED' | 'SGD' | 'AUD' | 'JPY'

// Static exchange rates relative to 1 USD
const RATES_FROM_USD: Record<SupportedCurrency, number> = {
  USD: 1,
  INR: 83.5,
  NPR: 133.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SGD: 1.35,
  AUD: 1.53,
  JPY: 154.0,
}

export const currencyEngine = {
  rates: RATES_FROM_USD,

  convert(amount: number, from: SupportedCurrency, to: SupportedCurrency): number {
    if (from === to) return amount
    const inUSD = amount / RATES_FROM_USD[from]
    return Number((inUSD * RATES_FROM_USD[to]).toFixed(2))
  },

  format(amount: number, currency: SupportedCurrency, locale = 'en-US'): string {
    try {
      return new Intl.NumberFormat(locale, {
        style:                 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${currency} ${amount.toFixed(2)}`
    }
  },

  getSymbol(currency: SupportedCurrency): string {
    const symbols: Record<SupportedCurrency, string> = {
      USD: '$', INR: '₹', NPR: 'Rs.', EUR: '€',
      GBP: '£', AED: 'د.إ', SGD: 'S$', AUD: 'A$', JPY: '¥',
    }
    return symbols[currency]
  },
}
