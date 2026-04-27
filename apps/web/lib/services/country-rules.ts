/**
 * Country rules engine (A26)
 * Enforces origin-market rules: sellers can only list products from their registered country.
 */

export interface CountryRule {
  code: string
  name: string
  region: string
  deliveryAvailable: boolean
  restrictedCategories?: string[]  // categories blocked for this country
  requiresOriginProof: boolean
}

// Lookup table — extend from DB in prod
const COUNTRY_RULES: Record<string, CountryRule> = {
  VN: { code: 'VN', name: 'Vietnam',         region: 'Asia',    deliveryAvailable: true, requiresOriginProof: true },
  JP: { code: 'JP', name: 'Japan',            region: 'Asia',    deliveryAvailable: true, requiresOriginProof: true },
  IN: { code: 'IN', name: 'India',            region: 'Asia',    deliveryAvailable: true, requiresOriginProof: true },
  MA: { code: 'MA', name: 'Morocco',          region: 'Africa',  deliveryAvailable: true, requiresOriginProof: true },
  PE: { code: 'PE', name: 'Peru',             region: 'Americas',deliveryAvailable: true, requiresOriginProof: true },
  TR: { code: 'TR', name: 'Turkey',           region: 'Asia',    deliveryAvailable: true, requiresOriginProof: true },
  ET: { code: 'ET', name: 'Ethiopia',         region: 'Africa',  deliveryAvailable: true, requiresOriginProof: true },
  CO: { code: 'CO', name: 'Colombia',         region: 'Americas',deliveryAvailable: true, requiresOriginProof: true },
  KP: { code: 'KP', name: 'North Korea',      region: 'Asia',    deliveryAvailable: false, requiresOriginProof: true, restrictedCategories: ['all'] },
  IR: { code: 'IR', name: 'Iran',             region: 'Asia',    deliveryAvailable: false, requiresOriginProof: true, restrictedCategories: ['all'] },
}

export function getCountryRule(code: string): CountryRule | undefined {
  return COUNTRY_RULES[code.toUpperCase()]
}

export function canSellerListProduct(sellerCountry: string, productCountry: string): boolean {
  return sellerCountry.toUpperCase() === productCountry.toUpperCase()
}

export function isDeliveryAvailable(country: string): boolean {
  const rule = getCountryRule(country)
  if (!rule) return true  // default allow if not in restriction list
  return rule.deliveryAvailable
}

export function isCategoryRestricted(country: string, categorySlug: string): boolean {
  const rule = getCountryRule(country)
  if (!rule?.restrictedCategories) return false
  return rule.restrictedCategories.includes('all') || rule.restrictedCategories.includes(categorySlug)
}

export function validateOriginListing(sellerCountry: string, productCountry: string, categorySlug?: string): { valid: boolean; reason?: string } {
  if (!canSellerListProduct(sellerCountry, productCountry)) {
    return { valid: false, reason: `Sellers registered in ${sellerCountry} can only list products made in ${sellerCountry}.` }
  }
  if (!isDeliveryAvailable(productCountry)) {
    return { valid: false, reason: `Delivery is not available for products from ${productCountry}.` }
  }
  if (categorySlug && isCategoryRestricted(productCountry, categorySlug)) {
    return { valid: false, reason: `Category "${categorySlug}" is restricted for ${productCountry}.` }
  }
  return { valid: true }
}
