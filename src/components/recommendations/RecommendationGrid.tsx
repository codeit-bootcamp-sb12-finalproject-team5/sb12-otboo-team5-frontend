import RecommendationItem from './RecommendationItem';
import {useRecommendationStore} from "@/lib/stores/useRecommendationStore.ts";
import {useState} from 'react';
import type {RecommendedOutfitDto} from '@/lib/api';
import RecommendationDetailModal from './RecommendationDetailModal';
import AddOutfitModal from './AddOutfitModal';

export default function RecommendationGrid() {
  const {data: recommendations, loading} = useRecommendationStore();
  const [selectedOutfit, setSelectedOutfit] = useState<RecommendedOutfitDto>();
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);
  const [outfitToRegister, setOutfitToRegister] = useState<RecommendedOutfitDto>();
  const [registrationCategory, setRegistrationCategory] = useState<'OOTD' | 'OUTFIT'>('OUTFIT');

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {[...Array(10)].map((_, index) => (
          <div 
            key={index}
            className="bg-white rounded-[20px] shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)] border border-[#e7e7e9] overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const outfits = recommendations?.outfits.filter(outfit => outfit.clothes.length > 0) ?? [];

  if (outfits.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-16">
        <p className="text-gray-500 text-lg">추천할 옷을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 gap-5 p-1 xl:grid-cols-3">
        {outfits.map((outfit) => (
          <button
            key={outfit.rank}
            type="button"
            onClick={() => setSelectedOutfit(outfit)}
            className="flex flex-col gap-5 rounded-[18px] border border-[#e7e7e9] bg-white p-5 text-left shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)] transition-all hover:-translate-y-0.5 hover:border-[#1e89f4] hover:shadow-[0px_6px_14px_0px_rgba(30,137,244,0.12)]"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-extrabold text-[#212126] text-[18px] tracking-[-0.45px]">
                  추천 코디 {outfit.rank}
                </h3>
                {outfit.styleTags.length > 0 && (
                  <div className="flex max-w-[65%] gap-1 overflow-x-auto">
                    {outfit.styleTags.map((tag) => (
                      <span key={tag} className="shrink-0 rounded-full bg-[#e8f3ff] px-2 py-1 font-semibold text-[#1e89f4] text-[12px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {outfit.reason && (
                <p className="line-clamp-2 text-[#696975] text-[14px] leading-5">{outfit.reason}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {outfit.clothes.map((item) => (
                <RecommendationItem key={item.id} item={item} />
              ))}
            </div>
          </button>
        ))}
      </div>
      <RecommendationDetailModal
        outfit={selectedOutfit}
        onClose={() => setSelectedOutfit(undefined)}
        onRegisterOotd={() => {
          setOutfitToRegister(selectedOutfit);
          setSelectedOutfit(undefined);
          setRegistrationCategory('OOTD');
          setIsOutfitModalOpen(true);
        }}
        onRegisterOutfit={() => {
          setOutfitToRegister(selectedOutfit);
          setSelectedOutfit(undefined);
          setRegistrationCategory('OUTFIT');
          setIsOutfitModalOpen(true);
        }}
      />
      <AddOutfitModal
        open={isOutfitModalOpen}
        outfit={outfitToRegister}
        category={registrationCategory}
        onClose={() => {
          setIsOutfitModalOpen(false);
          setOutfitToRegister(undefined);
        }}
      />
    </div>
  );
}
