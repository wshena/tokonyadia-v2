"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { CarouselStore } from "@/lib/zustand/CarouselStore";

interface CarouselProps {
  children: React.ReactNode[];
  itemsPerView?: number;
  scrollBy?: number;
  slideWidth?: number;
  gap?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  infinite?: boolean;
  showDots?: boolean;
  showButtons?: boolean;
  className?: string;
  store: CarouselStore;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  itemsPerView = 4,
  scrollBy = 1,
  slideWidth = 300,
  gap = 16,
  autoPlay = false,
  autoPlayInterval = 5000,
  infinite = true,
  className = "",
  store, // Store instance dari prop
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const items = useMemo(() => {
    if (children.length === 0) return [];
    if (!infinite) return children;

    const startItems = children.slice(-itemsPerView);
    const endItems = children.slice(0, itemsPerView);
    return [...startItems, ...children, ...endItems];
  }, [children, infinite, itemsPerView]);

  // Subscribe ke state dari store
  const currentIndex = store((state) => state.currentIndex);
  const isTransitioning = store((state) => state.isTransitioning);
  const setCurrentIndex = (index: number) => store.setState({ currentIndex: index });
  const setItemsPerView = store((state) => state.setItemsPerView);
  const setScrollBy = store((state) => state.setScrollBy);
  const setInfinite = store((state) => state.setInfinite);
  const setChildrenLength = store((state) => state.setChildrenLength);
  const setTotalItems = store((state) => state.setTotalItems);
  const setIsTransitioning = store((state) => state.setIsTransitioning);
  const goToNext = store((state) => state.goToNext);

  // Inisialisasi store
  useEffect(() => {
    if (children.length === 0) return;

    setItemsPerView(itemsPerView);
    setScrollBy(scrollBy);
    setInfinite(infinite);
    setTotalItems(children.length);
    setChildrenLength(children.length);
  }, [
    children.length,
    itemsPerView,
    scrollBy,
    infinite,
    setItemsPerView,
    setScrollBy,
    setInfinite,
    setTotalItems,
    setChildrenLength,
  ]);

  // Auto play
  useEffect(() => {
    if (autoPlay && !isTransitioning && children.length > 0) {
      autoPlayRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, isTransitioning, children.length, goToNext]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);

    // Reset ke posisi asli untuk infinite scroll
    if (infinite && items.length > 0 && children.length > 0) {
      if (currentIndex >= children.length + itemsPerView) {
        if (carouselRef.current) {
          carouselRef.current.style.transition = "none";
        }
        setCurrentIndex(itemsPerView);
        setTimeout(() => {
          if (carouselRef.current) {
            carouselRef.current.style.transition = "";
          }
        }, 50);
      } else if (currentIndex < itemsPerView) {
        if (carouselRef.current) {
          carouselRef.current.style.transition = "none";
        }
        setCurrentIndex(children.length);
        setTimeout(() => {
          if (carouselRef.current) {
            carouselRef.current.style.transition = "";
          }
        }, 50);
      }
    }
  };

  // Hitung offset slide
  const getOffset = () => {
    if (items.length === 0) return 0;
    return -currentIndex * (slideWidth + gap);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="overflow-hidden">
        <div
          ref={carouselRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(${getOffset()}px)`,
            gap: `${gap}px`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="shrink-0"
              style={{ width: `${slideWidth}px` }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
