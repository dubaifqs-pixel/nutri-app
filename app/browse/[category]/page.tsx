'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { GRADE_COLORS, GRADE_GRADIENTS, type Grade } from '@/lib/types'
import { calculateGrade } from '@/lib/scoring'
import { addToHistory } from '@/lib/history'
import { DEMO_PRODUCTS, type DemoProduct } from '@/lib/demo-products'
import { getProductImage } from '@/lib/product-images'
import BottomNav from '@/components/BottomNav'

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
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] bg-white" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="w-12 h-12 rounded-xl shrink-0 shimmer-loading" />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="h-3.5 rounded-lg w-3/4 shimmer-loading" />
        <div className="h-3 rounded-lg w-1/3 shimmer-loading" />
      </div>
      <div className="w-9 h-9 rounded-xl shrink-0 shimmer-loading" />
    </div>
  )
}

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-[#1A1A1A] px-1.5 py-0.5 rounded-full leading-none" style={{ background: 'rgba(26, 26, 26, 0.06)' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
      Curated
    </span>
  )
}

function CategoryContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const category = params.category as string
  const categoryName = CATEGORY_NAMES[category] || category
  const returnTo = searchParams.get('return')
  const compareSlot = searchParams.get('slot')

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

  const sendToCompareOrResult = (productData: any, gradeResult: any) => {
    addToHistory(productData, gradeResult)
    if (returnTo === 'compare' && (compareSlot === '1' || compareSlot === '2')) {
      sessionStorage.setItem(`dfqs_compare_${compareSlot}`, JSON.stringify(productData))
      sessionStorage.setItem(`dfqs_compare_${compareSlot}_grade`, JSON.stringify(gradeResult))
      router.push('/compare')
      return
    }
    sessionStorage.setItem('dfqs_product', JSON.stringify(productData))
    sessionStorage.setItem('dfqs_grade', JSON.stringify(gradeResult))
    router.push('/result')
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
    sendToCompareOrResult(productData, gradeResult)
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
    sendToCompareOrResult(productData, gradeResult)
  }

  const hasMore = products.length < total

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col gap-6 mesh-bg pb-[80px]">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <button onClick={() => router.push('/browse')} className="text-[#7A7A7A] transition-colors hover:text-[#1A1A1A] min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-xl hover:bg-[#1A1A1A]/5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-lg font-bold text-[#1A1A1A]">{categoryName}</h1>
      </div>

      {/* Demo Products */}
      {demoGraded.length > 0 && (
        <div className="flex flex-col gap-2 animate-slide-up stagger-1">
          <div className="flex items-center gap-2 px-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
            <span className="text-xs font-semibold text-[#ACACAC] uppercase tracking-[0.08em]">Curated UAE Products</span>
          </div>
          {demoGraded.map((dp, i) => (
            <button
              key={`demo-${dp.product_name}-${i}`}
              onClick={() => handleDemoProductClick(dp)}
              className="flex items-center gap-3 px-4 py-3.5 bg-white text-left animate-slide-up transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
              style={{ animationDelay: `${(i + 1) * 50}ms`, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <img
                src={getProductImage(dp.product_name, dp.grade)}
                alt=""
                loading="lazy"
                className="w-12 h-12 rounded-xl object-cover bg-[#F5F4F0] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{dp.product_name}</p>
                  <DemoBadge />
                </div>
                <p className="text-[11px] text-[#7A7A7A] mt-0.5 truncate">{dp.brand}</p>
              </div>
              <span
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                style={{ background: GRADE_GRADIENTS[dp.grade] }}
              >
                {dp.grade}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Divider */}
      {demoGraded.length > 0 && !loading && products.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.06)] to-transparent" />
          <span className="text-[10px] font-medium text-[#ACACAC] uppercase tracking-[0.12em]">Database Results</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.06)] to-transparent" />
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

      {/* Error State — only show when there are no curated products either */}
      {error && !loading && demoGraded.length === 0 && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7A7A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto opacity-30 mb-3"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <p className="text-sm text-[#7A7A7A]">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && demoGraded.length === 0 && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7A7A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto opacity-30 mb-3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <p className="text-sm text-[#7A7A7A]">No products found in this category</p>
        </div>
      )}

      {/* Product List */}
      {!loading && products.length > 0 && (
        <div className="flex flex-col gap-2">
          {products.map((product, i) => (
            <button
              key={`${product.barcode || product.product_name}-${i}`}
              onClick={() => handleProductClick(product)}
              className="flex items-center gap-3 px-4 py-3.5 bg-white text-left animate-slide-up transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
              style={{ animationDelay: `${i * 40}ms`, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt=""
                  loading="lazy"
                  className="w-12 h-12 rounded-xl object-cover bg-white shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#F5F4F0] shrink-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.product_name}</p>
              </div>
              <span
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                style={{ background: GRADE_GRADIENTS[product.grade] }}
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
              className="w-full py-3.5 rounded-2xl btn-outline text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#7A7A7A] border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                'Load more'
              )}
            </button>
          )}
        </div>
      )}
      <BottomNav active="browse" />
    </div>
  )
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F4F0' }}><div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1A1A1A', borderTopColor: 'transparent' }} /></div>}>
      <CategoryContent />
    </Suspense>
  )
}
