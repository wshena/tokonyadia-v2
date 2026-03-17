import React from 'react'

const MainContainer = ({children}:{children:React.ReactNode}) => {
  return (
    <div className='relative w-full'>{children}</div>
  )
}

export default MainContainer