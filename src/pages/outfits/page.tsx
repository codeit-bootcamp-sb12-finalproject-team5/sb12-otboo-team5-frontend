import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OutfitCard from '@/components/outfits/OutfitCard';
import OutfitDetailModal from '@/components/outfits/OutfitDetailModal';
import OutfitFilter from '@/components/outfits/OutfitFilter';
import CreateOutfitModal from '@/components/outfits/CreateOutfitModal';
import { useOutfits } from '@/lib/hooks/useOutfits';
import type { OutfitDto } from '@/lib/api/types';
import hangerIcon from '@/assets/icons/il_hanger.svg';

export default function OutfitsPage() {
  const { outfits, loading, error, reload, updateOutfit, removeOutfit } = useOutfits();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitDto | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const selectedCardRef = useRef<HTMLButtonElement | null>(null);
  const requestedCategory = searchParams.get('category') || 'OOTD';
  const categories = ['OOTD', 'outfit'];
  const selectedCategory = categories.includes(requestedCategory) ? requestedCategory : 'OOTD';
  const visibleOutfits = outfits.filter(outfit => {
    if (selectedCategory === 'OOTD') return outfit.category === 'OOTD';
    return outfit.category.toLowerCase() === 'outfit';
  });

  return (
    <div className="flex h-full flex-col px-10 py-2.5">
      <h1 className="sr-only">아웃핏</h1>
      <div className="mb-6 shrink-0">
        <OutfitFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={category => {
            setSearchParams(previous => {
              const next = new URLSearchParams(previous);
              next.set('category', category);
              return next;
            });
          }}
          onCreate={() => setIsCreateModalOpen(true)}
        />
      </div>

      <section aria-label={`${selectedCategory} 아웃핏 목록`} aria-busy={loading} className="min-h-0 flex-1 overflow-y-auto px-1 pb-6">
        {error && (
          <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div>
              <p className="font-semibold text-gray-800">아웃핏을 불러오지 못했습니다.</p>
              <p className="mt-1 text-sm text-gray-600">{error}</p>
            </div>
            <Button variant="secondary" onClick={reload}>다시 시도</Button>
          </div>
        )}

        {visibleOutfits.length > 0 ? (
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleOutfits.map(outfit => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                onClick={event => {
                  selectedCardRef.current = event.currentTarget;
                  setSelectedOutfit(outfit);
                }}
              />
            ))}
          </div>
        ) : !loading && !error ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 py-16 text-center">
            <img src={hangerIcon} alt="" className="h-20 w-20" />
            <p className="break-words text-lg font-semibold text-gray-500">
              {selectedCategory} 아웃핏이 아직 없습니다.
            </p>
          </div>
        ) : null}

        {loading && (
          <div role="status" className="flex items-center justify-center gap-2 py-12 text-gray-500">
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
            아웃핏을 불러오는 중입니다.
          </div>
        )}
      </section>

      {selectedOutfit && (
        <OutfitDetailModal
          key={selectedOutfit.id}
          outfit={selectedOutfit}
          onClose={() => setSelectedOutfit(null)}
          onCloseAutoFocus={() => selectedCardRef.current?.focus()}
          onUpdate={updatedOutfit => {
            updateOutfit(updatedOutfit);
            setSelectedOutfit(updatedOutfit);
          }}
          onDelete={outfitId => {
            removeOutfit(outfitId);
            setSelectedOutfit(null);
          }}
        />
      )}
      <CreateOutfitModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreated={reload}
      />
    </div>
  );
}
