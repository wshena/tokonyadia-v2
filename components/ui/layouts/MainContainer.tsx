"use client";

import { useUtilityStore } from "@/lib/zustand/utilityStore";
import React, { Suspense } from "react";
import Alert from "../feedback/Alert";
import ModalContainer from "../modals/ModalContainer";
import RouteLoadingBar from "../feedback/RouteLoadingBar";
import dynamic from "next/dynamic";

interface MainContainerProps {
  children: React.ReactNode;
}

const AssistantButton = dynamic(
  () =>
    import("@/components/ai-assistant/AssistantButton").then((m) => ({
      default: m.AssistantButton,
    })),
  { ssr: false }, // penting — karena pakai useState dan hanya perlu di client
);

const MainContainer = ({ children }: MainContainerProps) => {
  const alert = useUtilityStore((state) => state.alert);
  const isModalOpen = useUtilityStore((state) => state.isModalOpen);
  const modalContent = useUtilityStore((state) => state.modalContent);
  const modalOptions = useUtilityStore((state) => state.modalOptions);
  const closeModal = useUtilityStore((state) => state.closeModal);

  return (
    <div className="relative min-h-screen w-full">
      <Suspense fallback={null}>
        <RouteLoadingBar />
      </Suspense>

      {/* Alert — tampil di semua halaman */}
      {alert.label && <Alert label={alert.label} type={alert.type} />}

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

      <AssistantButton />
    </div>
  );
};

export default MainContainer;
