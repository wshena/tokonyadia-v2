import Image from 'next/image'
import React from 'react'

const CustomBanner = ({label}:{label:React.ReactNode}) => {
  return (
    <div className='relative w-full'>
      <div className="w-full h-[150px] md:h-[200px] lg:h-[300px]">
        <Image src={'/image/empty-banner.image'} fill loading='lazy' className='w-full h-full object-cover' alt='banner-image' />
      </div>

      {/* title */}
      <div className="absolute pl-10 w-full h-full top-0 left-0 flex items-center justify">
        {label}
      </div>
    </div>
  )
}

export default CustomBanner