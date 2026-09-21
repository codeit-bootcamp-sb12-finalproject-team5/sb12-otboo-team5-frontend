import type { MouseEvent } from 'react';
import type { OutfitDto } from '@/lib/api/types';
import OutfitImage from './OutfitImage';
import OutfitWeather from './OutfitWeather';

interface OutfitCardProps {
  outfit: OutfitDto;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function OutfitCard({ outfit, onClick }: OutfitCardProps) {
  const clothes = outfit.clothes.filter(item => item.imageUrl);
  const createdAt = outfit.createdAt ? new Date(outfit.createdAt) : null;
  const formattedCreatedAt = createdAt && !Number.isNaN(createdAt.getTime())
    ? `${createdAt.getMonth() + 1}월 ${createdAt.getDate()}일 ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${outfit.name} 상세보기`}
      className="flex w-full min-w-0 cursor-pointer flex-col gap-4 rounded-[20px] border border-zinc-200 bg-white px-3 py-4 text-left transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="flex min-h-9 w-full items-start justify-between gap-2 px-1.5">
        <div className="min-w-0">
          <h2 className="line-clamp-2 break-words text-lg font-bold tracking-[-0.45px] text-gray-900">
            {outfit.name}
          </h2>
          {formattedCreatedAt && (
            <p className="mt-1 text-sm font-semibold tracking-[-0.35px] text-gray-500">
              {formattedCreatedAt}
            </p>
          )}
        </div>
        {outfit.weather && <OutfitWeather weather={outfit.weather} compact />}
      </div>

      <div className={`grid aspect-[307.5/206] w-full gap-0.5 overflow-hidden rounded bg-gray-100 ${clothes.length > 1 ? 'grid-cols-[3fr_2fr]' : 'grid-cols-1'}`}>
        <div className="relative min-h-0 min-w-0">
          <OutfitImage imageUrl={clothes[0]?.imageUrl} alt={clothes[0]?.name || outfit.name} />
        </div>
        {clothes.length > 1 && (
          <div className={`grid min-h-0 min-w-0 gap-0.5 ${clothes.length > 2 ? 'grid-rows-2' : 'grid-rows-1'}`}>
            {clothes.slice(1, 3).map((item, index) => (
              <div key={item.id} className="relative min-h-0 min-w-0">
                <OutfitImage imageUrl={item.imageUrl} alt={item.name || `의류 ${index + 2}`} />
                {index === 1 && clothes.length > 3 && (
                  <span className="absolute right-2 top-2 rounded-full bg-gray-900/90 px-2 py-1 text-sm font-semibold text-white">
                    +{clothes.length - 3}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full min-w-0 px-0.5">
        <p className="line-clamp-3 whitespace-pre-line break-words text-base leading-normal tracking-[-0.4px] text-gray-700">
          {outfit.description}
        </p>
      </div>
    </button>
  );
}
