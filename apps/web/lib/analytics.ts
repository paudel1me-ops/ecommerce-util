/**
 * Analytics tracker (A34) — console adapter, swap for PostHog/Segment
 */

export type AnalyticsEvent =
  | 'product_view'
  | 'order_placed'
  | 'order_delivered'
  | 'delivery_started'
  | 'delivery_completed'
  | 'seller_product_created'
  | 'user_login'
  | 'checkout_started'

interface TrackOptions {
  userId?: string
  [key: string]: unknown
}

export function track(event: AnalyticsEvent, props?: TrackOptions): void {
  const payload = {
    event,
    ts: new Date().toISOString(),
    ...props,
  }
  // TODO: Replace with PostHog.capture() / Segment.track()
  if (process.env.NODE_ENV !== 'test') {
    console.log('[analytics]', JSON.stringify(payload))
  }
}
