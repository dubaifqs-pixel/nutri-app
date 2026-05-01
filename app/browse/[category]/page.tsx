'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { GRADE_COLORS, type Grade } from '@/lib/types'
import { calculateGrade } from '@/lib/scoring'
import { addToHistory } from '@/lib/history'
import { DEMO_PRODUCTS, type DemoProduct } from '@/lib/demo-products'

const CATEGORY_NAMES: Record<string, string> = {
  dairy: 'Dairy',
  beverages: 'Beverages',
  snacks: 'Snacks',
  cereals: 'Cereals',
  bread: 'Bread & Bakery',
  meat: 'Meat & Poultry',
  fruits: 'Fruits & Vegetables',
  frozen: 'Frozen Foods',
}

interface BrowseProduct {
  product_name: string
  image_url: string | null
  grade: Grade
  score: number
  nutrition: any
  barcode: string | null
}

function ProductSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-100 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />
    </div>
  )
}

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-[#D89A0E] bg-[#F1B123]/10 px-1.5 py-0.5 rounded-full leading-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
      Curated
    </span>
  )
}

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  const category = params.category as string
  const categoryName = CATEGORY_NAMES[category] || category

  const [products, setProducts] = useState<BrowseProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  const demoProducts: DemoProduct[] = DEMO_PRODUCTS[category] || []
  const demoGraded = demoProducts.map((dp) => {
    const result = calculateGrade(dp.nutrition)
    return { ...dp, grade: result.grade, score: result.score }
  })

  const fetchProducts = async (pageNum: number, append: boolean = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)

    try {
      const res = await fetch(`/api/browse?category=${category}&page=${pageNum}`)
      if (!res.ok) {
        setError('Failed to load products')
        return
      }
      const data = await res.json()
      if (append) {
        setProducts((prev) => [...prev, ...data.products])
      } else {
        setProducts(data.products)
      }
      setTotal(data.total)
      setPage(data.page)
    } catch {
      setError('Failed to load products')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (category && CATEGORY_NAMES[category]) {
      fetchProducts(1)
    } else {
      setError('Invalid category')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const handleLoadMore = () => {
    fetchProducts(page + 1, true)
  }

  const handleProductClick = (product: BrowseProduct) => {
    const productData = {
      product_name: product.product_name,
      nutrition: product.nutrition,
      image_url: product.image_url || undefined,
      barcode: product.barcode || undefined,
      source: 'barcode' as const,
    }
    const gradeResult = calculateGrade(product.nutrition)
    addToHistory(productData, gradeResult)
    sessionStorage.setItem('dfqs_product', JSON.stringify(productData))
    sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
    router.push('/result')
  }

  const handleDemoProductClick = (dp: DemoProduct) => {
    const productData = {
      product_name: dp.product_name,
      nutrition: dp.nutrition,
      image_url: undefined,
      barcode: undefined,
      source: 'barcode' as const,
    }
    const gradeResult = calculateGrade(dp.nutrition)
    addToHistory(productData, gradeResult)
    sessionStorage.setItem('dfqs_product', JSON.stringify(productData))
    sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
    router.push('/result')
  }

  const hasMore = products.length < total

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/browse')} className="text-gray-400 transition-colors hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-bold text-[#3A3F57]">{categoryName}</h1>
      </div>

      {/* Demo Products */}
      {demoGraded.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D89A0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Curated UAE Products</span>
          </div>
          {demoGraded.map((dp, i) => (
            <button
              key={`demo-${dp.product_name}-${i}`}
              onClick={() => handleDemoProductClick(dp)}
              className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-100 text-left transition-all hover:border-gray-200 hover:bg-gray-50 active:scale-[0.99]"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-[#3A3F57] truncate">{dp.product_name}</p>
                  <DemoBadge />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{dp.brand} &middot; Score: {dp.score}</p>
              </div>
              <span
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: GRADE_COLORS[dp.grade] }}
              >
                {dp.grade}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Divider between demo and API products */}
      {demoGraded.length > 0 && !loading && products.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider">Database Results</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 mb-3"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      )}

      {/* Empty State — only show if also no demo products */}
      {!loading && !error && products.length === 0 && demoGraded.length === 0 && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 mb-3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <p className="text-sm text-gray-400">No products found in this category</p>
        </div>
      )}

      {/* Product List */}
      {!loading && products.length > 0 && (
        <div className="flex flex-col gap-2">
          {products.map((product, i) => (
            <button
              key={`${product.barcode || product.product_name}-${i}`}
              onClick={() => handleProductClick(product)}
              className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-100 text-left transition-all hover:border-gray-200 hover:bg-gray-50 active:scale-[0.99]"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover bg-white shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#3A3F57] truncate">{product.product_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Score: {product.score}</p>
              </div>
              <span
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: GRADE_COLORS[product.grade] }}
              >
                {product.grade}
              </span>
            </button>
          ))}

          {/* Load More */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 hover:text-gray-600 active:scale-[0.98] disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                'Load more'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
