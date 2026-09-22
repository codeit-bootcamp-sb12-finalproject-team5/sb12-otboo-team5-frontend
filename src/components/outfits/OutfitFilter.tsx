import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface OutfitFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onCreate: () => void;
}

export default function OutfitFilter({ categories, selectedCategory, onCategoryChange, onCreate }: OutfitFilterProps) {
  return (
    <div className="flex w-full items-center justify-between gap-6">
      <nav aria-label="아웃핏 카테고리" className="flex min-w-0 flex-1 gap-5 overflow-x-auto">
        {categories.map(category => (
          <button
            key={category}
            type="button"
            aria-pressed={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
            className={`shrink-0 cursor-pointer border-b-4 px-[18px] py-4 text-lg font-bold tracking-[-0.45px] whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
              selectedCategory === category
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-700 hover:text-blue-500'
            }`}
          >
            {category}
          </button>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-3">
        <Button type="button" variant="outline" onClick={onCreate}>
          OOTD/outfit 만들기
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
