import { type PointerEvent, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface OutfitFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onCreate: () => void;
}

export default function OutfitFilter({ categories, selectedCategory, onCategoryChange, onCreate }: OutfitFilterProps) {
  const categoryListRef = useRef<HTMLElement>(null);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0, active: false });

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    const list = categoryListRef.current;
    if (!list || event.button !== 0) return;

    dragStartRef.current = { x: event.clientX, scrollLeft: list.scrollLeft, active: true };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const list = categoryListRef.current;
    if (!list || !dragStartRef.current.active) return;
    list.scrollLeft = dragStartRef.current.scrollLeft - (event.clientX - dragStartRef.current.x);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLElement>) => {
    dragStartRef.current.active = false;
  };

  return (
    <div className="flex w-full items-center justify-between gap-6">
      <nav
        ref={categoryListRef}
        aria-label="아웃핏 카테고리"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        className="flex min-w-0 flex-1 touch-pan-y select-none gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map(category => (
          <button
            key={category}
            type="button"
            aria-pressed={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
            className={`shrink-0 cursor-pointer border-b-4 px-[18px] py-4 text-lg font-bold tracking-[-0.45px] whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3d5570] ${
              selectedCategory === category
                ? 'border-[#3d5570] text-[#3d5570]'
                : 'border-transparent text-gray-700 hover:text-[#3d5570]'
            }`}
          >
            {category}
          </button>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-3">
        <Button type="button" variant="outline" onClick={onCreate}>
          OOTD/OUTFIT 만들기
        </Button>
        <Button asChild>
          <Link to={`/outfits/new?${new URLSearchParams({ category: selectedCategory })}`}>
            아웃핏 추천받기
          </Link>
        </Button>
      </div>
    </div>
  );
}
