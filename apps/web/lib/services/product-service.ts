/**
 * Product service (A48) — business logic only. Calls productRepo.
 * Layer rule: no HTTP imports, no direct store access.
 */
import { productRepo } from '@/lib/repositories/product-repo'
import type { ProductFilters } from '@/lib/repositories/product-repo'
import { countryRules } from '@/lib/country/rules'
import { logger } from '@/lib/logger'
import { track } from '@/lib/analytics'
import { ok, err } from '@/lib/types'
import type { Product, ApiResponse } from '@/lib/types'

export interface CreateProductInput {
  sellerId:      string
  sellerCountry: string
  name:          string
  description:   string
  price:         number
  currency?:     string
  country:       string
  category:      string
  images:        string[]
  stock:         number
  tags?:         string[]
}

export const productService = {
  async create(input: CreateProductInput): Promise<ApiResponse<Product>> {
    if (!input.name?.trim())  return err('VALIDATION', 'Product name is required.')
    if (input.price <= 0)     return err('VALIDATION', 'Price must be greater than 0.')
    if (input.stock < 0)      return err('VALIDATION', 'Stock cannot be negative.')

    if (!countryRules.canSellerListFromCountry(input.sellerCountry, input.country))
      return err('COUNTRY_RESTRICTED', `Products from ${input.country} cannot be listed by sellers from ${input.sellerCountry}.`)

    const product = productRepo.create({
      sellerId:    input.sellerId,
      name:        input.name.trim(),
      description: (input.description ?? '').trim(),
      price:       input.price,
      currency:    input.currency ?? 'USD',
      country:     input.country.toUpperCase(),
      category:    input.category.toLowerCase(),
      images:      input.images ?? [],
      stock:       input.stock,
      rating:      0,
      reviewCount: 0,
      status:      'active',
      tags:        input.tags ?? [],
    })

    logger.info('product.created', { productId: product.id, sellerId: product.sellerId })
    track('seller_product_created', { productId: product.id, category: product.category })
    return ok(product)
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    const product = productRepo.findById(id)
    if (!product) return err('NOT_FOUND', 'Product not found.')
    track('product_view', { productId: id })
    return ok(product)
  },

  async list(filters?: ProductFilters): Promise<ApiResponse<Product[]>> {
    const products = productRepo.findAll(filters)
    return ok(products, { total: products.length })
  },

  async update(
    id: string,
    sellerId: string,
    data: Partial<Pick<Product, 'name' | 'description' | 'price' | 'stock' | 'status' | 'images' | 'tags'>>
  ): Promise<ApiResponse<Product>> {
    const product = productRepo.findById(id)
    if (!product)                       return err('NOT_FOUND', 'Product not found.')
    if (product.sellerId !== sellerId)  return err('FORBIDDEN', 'You do not own this product.')
    const updated = productRepo.update(id, data)
    if (!updated) return err('UPDATE_FAILED', 'Could not update product.')
    return ok(updated)
  },

  async remove(id: string, sellerId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const product = productRepo.findById(id)
    if (!product)                       return err('NOT_FOUND', 'Product not found.')
    if (product.sellerId !== sellerId)  return err('FORBIDDEN', 'You do not own this product.')
    productRepo.delete(id)
    return ok({ deleted: true })
  },
}
