/**
 * Country rules engine (A60)
 * Enforces: origin restrictions, delivery zones, COD availability.
 * All rules are data-driven — no business logic in API routes.
 */

// ─── Sanctioned / restricted origins ─────────────────────────────────────────
const RESTRICTED_ORIGINS = new Set(['KP', 'IR', 'SY', 'CU', 'RU'])

// ─── COD availability by country ─────────────────────────────────────────────
const COD_COUNTRIES = new Set([
  'IN', 'NP', 'BD', 'PK', 'LK', 'MM', 'KH', 'LA',
  'VN', 'PH', 'ID', 'EG', 'NG', 'KE', 'GH', 'ET',
  'MA', 'TN', 'GH', 'CO', 'PE',
])

// ─── Delivery-supported countries ─────────────────────────────────────────────
const DELIVERY_COUNTRIES = new Set([
  'IN', 'NP', 'BD', 'PK', 'LK', 'US', 'GB', 'AU',
  'CA', 'DE', 'FR', 'SG', 'MY', 'TH', 'VN', 'PH',
  'ID', 'AE', 'SA', 'EG', 'NG', 'KE', 'ZA', 'MA',
  'TR', 'ET', 'CO', 'PE', 'JP',
])

// ─── Regional groupings (for shipping fee calc) ────────────────────────────────
const REGIONS: string[][] = [
  ['IN', 'NP', 'BD', 'PK', 'LK', 'MM'],
  ['US', 'CA', 'MX'],
  ['DE', 'FR', 'GB', 'IT', 'ES', 'NL', 'BE', 'PL', 'TR'],
  ['SG', 'MY', 'TH', 'VN', 'PH', 'ID', 'KH', 'LA', 'JP'],
  ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'],
  ['NG', 'KE', 'GH', 'ET', 'EG', 'ZA', 'MA', 'TN', 'CO', 'PE'],
]

function sameRegion(a: string, b: string): boolean {
  return REGIONS.some(r => r.includes(a) && r.includes(b))
}

export const countryRules = {
  isOriginAllowed(country: string): boolean {
    return !RESTRICTED_ORIGINS.has(country.toUpperCase())
  },

  isCodAvailable(country: string): boolean {
    return COD_COUNTRIES.has(country.toUpperCase())
  },

  isDeliverySupported(country: string): boolean {
    return DELIVERY_COUNTRIES.has(country.toUpperCase())
  },

  /**
   * Core marketplace rule: sellers can only list products originating from
   * their registered country. e.g. a seller registered in India can only
   * list products made in India.
   */
  canSellerListFromCountry(sellerCountry: string, originCountry: string): boolean {
    const origin = originCountry.toUpperCase()
    const seller = sellerCountry.toUpperCase()
    if (!this.isOriginAllowed(origin)) return false
    // Core rule: must match
    return seller === origin
  },

  getShippingFee(originCountry: string, destinationCountry: string): number {
    const a = originCountry.toUpperCase()
    const b = destinationCountry.toUpperCase()
    if (a === b)              return 2.00
    if (sameRegion(a, b))    return 5.00
    return 12.00
  },
}
