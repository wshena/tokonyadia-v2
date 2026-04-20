'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CancelIcon, SearchIcon } from '@/components/icon'
import DesktopSearchModal from './ui/modals/DesktopSearchModal'
import type { ProductCardData } from './ui/card/ProductCard'

const SearchForm = () => {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [suggestions, setSuggestions] = useState<ProductCardData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchQueryString = searchParams.toString()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(searchInput.trim())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    const keyword = debouncedKeyword.trim()

    if (!keyword) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    let isCancelled = false
    setIsLoading(true)

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `/api/search?section=products&keyword=${encodeURIComponent(keyword)}&page=1&limit=6`,
          { cache: 'no-store' }
        )

        const payload = await response.json()
        if (!response.ok) {
          throw new Error(payload?.message ?? 'Gagal memuat pencarian')
        }

        if (!isCancelled) {
          setSuggestions(payload?.data ?? [])
        }
      } catch {
        if (!isCancelled) {
          setSuggestions([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchSuggestions()

    return () => {
      isCancelled = true
    }
  }, [debouncedKeyword])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsModalOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  useEffect(() => {
    setIsModalOpen(false)
  }, [pathname, searchQueryString])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    setIsModalOpen(false)
    router.push(`/search?keyword=${encodeURIComponent(searchInput.trim())}`)
  }

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <form
        onSubmit={handleSearch}
        className="flex py-2 px-3 rounded-[10px] items-center gap-2.5 border border-gray-300 bg-white lg:w-[450px] xl:w-[800px] 2xl:w-[1000px]"
      >
        <button type="submit" className="cursor-pointer shrink-0">
          <SearchIcon size={20} color="black" />
        </button>
        <input
          type="text"
          name="product-form"
          id="product-form"
          placeholder="Cari di Tokonyadia"
          className="w-full bg-white text-black focus:outline-none"
          autoComplete="off"
          value={searchInput}
          onFocus={() => {
            if (searchInput.trim()) setIsModalOpen(true)
          }}
          onChange={(e) => {
            const value = e.target.value
            setSearchInput(value)
            setIsModalOpen(Boolean(value.trim()))
          }}
        />
        {searchInput.trim() && (
          <button onClick={() => {
            setSearchInput('')
            setIsModalOpen(false)
          }}>
            <CancelIcon size={20} color="black" />
          </button>
        )}
      </form>

      {isModalOpen && (
        <>
          <div className="fixed inset-0 top-20 z-40 bg-black/20" />
          <div className="absolute top-[calc(100%+0.75rem)] left-0 z-50 w-full">
            <DesktopSearchModal
              keyword={searchInput}
              products={suggestions}
              isLoading={isLoading}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default SearchForm
