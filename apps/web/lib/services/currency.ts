/**
 * Currency utilities (A25)
 * Formatter + converter with static rates (replace with live API in prod).
 */

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'NPR', 'JPY', 'AUD', 'CAD'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

// Static approximate rates vs USD — refresh from exchange-rate API in prod
const RATES_VS_USD: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.2,
  NPR: 133.1,
  JPY: 149.5,
  AUD: 1.53,
  CAD: 1.36,
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  const inUsd = amount / RATES_VS_USD[from]
  return Math.round(inUsd * RATES_VS_USD[to] * 100) / 100
}

const LOCALE_MAP: Partial<Record<Currency, string>> = {
  USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', INR: 'en-IN', JPY: 'ja-JP', AUD: 'en-AU', CAD: 'en-CA',
}

export function formatCurrencyFull(amount: number, currency: Currency): string {
  const locale = LOCALE_MAP[currency] ?? 'en-US'
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}
