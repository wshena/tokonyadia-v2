'use client'

import { useUtilityStore } from '@/lib/zustand/utilityStore'
import React from 'react'
import Alert from '../feedback/Alert'

interface MainContainerProps {
  children: React.ReactNode
}

const MainContainer = ({ children }: MainContainerProps) => {
  const alert = useUtilityStore(state => state.alert)  

  return (
    <div className="relative min-h-screen w-full">
      {/* Alert — tampil di semua halaman */}
      {alert.label && (
        <Alert
          label={alert.label}
          type={alert.type}
        />
      )}

      {/* Page Content */}
      {children}
    </div>
  )
}

export default MainContainer