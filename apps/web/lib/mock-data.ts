import type { ProductCardProps } from '@/components/marketplace/ProductCard'
import type { OrderCardProps, OrderStatus } from '@/components/marketplace/OrderCard'

export const MOCK_PRODUCTS: ProductCardProps[] = [
  { id: '1', title: 'Hand-woven Silk Scarf', price: 89.99, currency: 'USD', originCountry: 'VN', originVerdict: 'verified', sellerName: 'Hanoi Craft House', rating: 4.8, reviewCount: 124, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400' },
  { id: '2', title: 'Moroccan Argan Oil Set', price: 45.00, currency: 'USD', originCountry: 'MA', originVerdict: 'verified', sellerName: 'Atlas Beauty', rating: 4.6, reviewCount: 89, imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400' },
  { id: '3', title: 'Japanese Ceramic Bowl', price: 120.00, currency: 'USD', originCountry: 'JP', originVerdict: 'verified', sellerName: 'Kyoto Kilns', rating: 5.0, reviewCount: 42, imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400' },
  { id: '4', title: 'Peruvian Alpaca Blanket', price: 195.00, currency: 'USD', originCountry: 'PE', originVerdict: 'verified', sellerName: 'Andes Textiles', rating: 4.9, reviewCount: 67, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
  { id: '5', title: 'Indian Brass Lamp', price: 65.00, currency: 'USD', originCountry: 'IN', originVerdict: 'flagged', sellerName: 'Rajasthan Metals', rating: 4.2, reviewCount: 31, imageUrl: 'https://images.unsplash.com/photo-1573867639040-6dd25fa5f597?w=400' },
  { id: '6', title: 'Ethiopian Coffee Beans', price: 28.00, currency: 'USD', originCountry: 'ET', originVerdict: 'verified', sellerName: 'Yirgacheffe Farm', rating: 4.7, reviewCount: 203, imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400' },
  { id: '7', title: 'Turkish Kilim Rug 2×3', price: 340.00, currency: 'USD', originCountry: 'TR', originVerdict: 'verified', sellerName: 'Istanbul Looms', rating: 4.5, reviewCount: 18, imageUrl: 'https://images.unsplash.com/photo-1575386490706-9a5b9ab14f76?w=400' },
  { id: '8', title: 'Colombian Emerald Ring', price: 520.00, currency: 'USD', originCountry: 'CO', originVerdict: 'pending', sellerName: 'Bogotá Gems', rating: 4.4, reviewCount: 9, imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' },
]

export const MOCK_ORDERS: Omit<OrderCardProps, 'onViewDetails' | 'onTrack'>[] = [
  { orderId: 'ord-001-abc-xyz', status: 'delivered', total: 89.99, currency: 'USD', itemCount: 1, createdAt: '2024-03-01' },
  { orderId: 'ord-002-def-uvw', status: 'shipped',   total: 165.00, currency: 'USD', itemCount: 2, createdAt: '2024-03-10' },
  { orderId: 'ord-003-ghi-rst', status: 'pending',   total: 520.00, currency: 'USD', itemCount: 1, createdAt: '2024-03-14' },
]

export function getMockProduct(id: string): ProductCardProps | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id)
}
