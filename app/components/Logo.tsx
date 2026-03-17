import Link from 'next/link'
import React from 'react'

const Logo = () => {
  return (
    <Link href={'/'}>
      <h1 className='capitalize font-bold text-[1rem] lg:text-[2rem] text-green-600'>Tokonyadia</h1>
    </Link>
  )
}

export default Logo