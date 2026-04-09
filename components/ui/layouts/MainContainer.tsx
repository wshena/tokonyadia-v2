'use client'

import { useUtilityStore } from '@/lib/zustand/utilityStore'
import React from 'react'
import Alert from '../feedback/Alert'
import ModalContainer from '../modals/ModalContainer'

interface MainContainerProps {
  children: React.ReactNode
}

const MainContainer = ({ children }: MainContainerProps) => {
  const alert = useUtilityStore(state => state.alert)  
  const isModalOpen = useUtilityStore(state => state.isModalOpen)
  const modalContent = useUtilityStore(state => state.modalContent)
  const modalOptions = useUtilityStore(state => state.modalOptions)
  const closeModal = useUtilityStore(state => state.closeModal)

  return (
    <div className="relative min-h-screen w-full">
      {/* Alert — tampil di semua halaman */}
      {alert.label && (
        <Alert
          label={alert.label}
          type={alert.type}
        />
      )}

      <ModalContainer
        isOpen={isModalOpen}
        onClose={closeModal}
        showOverlay={modalOptions.showOverlay}
        closeOnOverlayClick={modalOptions.closeOnOverlayClick}
        overlayClassName={modalOptions.overlayClassName}
        contentClassName={modalOptions.contentClassName}
      >
        {modalContent}
      </ModalContainer>

      {/* Page Content */}
      {children}
    </div>
  )
}

export default MainContainer
