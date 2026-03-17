interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

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

interface CarouselConfig {
  itemsPerView: number;
  scrollBy: number;
  slideWidth?: number;
  gap?: number;
  infinite: boolean;
  autoPlay: boolean;
  showDots?: boolean;
  showButtons?: boolean;
  autoPlayInterval?: number;
}

interface CarouselButtonProps {
  direction: 'prev' | 'next';
  store: CarouselStore; // Wajib: store instance dari Carousel
  className?: string;
  disabledClassName?: string;
  children?: React.ReactNode;
  showDefaultIcon?: boolean;
  onClick?: () => void; // Optional: untuk override
}

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
}

interface CarouselItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}