'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon } from '@/components/icon'

const SearchForm = () => {
  const [searchInput, setSearchInput] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    router.push(`/search?keyword=${encodeURIComponent(searchInput.trim())}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="hidden lg:flex py-2 px-3 rounded-[10px] items-center gap-2.5 border border-gray-300 lg:w-[450px] xl:w-[800px] 2xl:w-[1000px]"
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
        onChange={(e) => setSearchInput(e.target.value)}
      />
    </form>
  )
}

export default SearchForm