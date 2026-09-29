import RecommendationItem from './RecommendationItem';
import {useRecommendationStore} from "@/lib/stores/useRecommendationStore.ts";
import {useState} from 'react';
import {generateOutfitImage, type OutfitCreateResponse, type RecommendedOutfitDto} from '@/lib/api';
import {toast} from 'sonner';
import RecommendationDetailModal from './RecommendationDetailModal';
import AddOutfitModal from './AddOutfitModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import fittingIllustration from '@/assets/illust_logos/recommendation-fitting.png';
import compositionIllustration from '@/assets/illust_logos/recommendation-composition.png';

export default function RecommendationGrid() {
  const {data: recommendations, loading} = useRecommendationStore();
  const [selectedOutfit, setSelectedOutfit] = useState<RecommendedOutfitDto>();
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);
  const [outfitToRegister, setOutfitToRegister] = useState<RecommendedOutfitDto>();
  const [registrationCategory, setRegistrationCategory] = useState<'OOTD' | 'OUTFIT'>('OUTFIT');
  const [isRegistrationConfirmOpen, setIsRegistrationConfirmOpen] = useState(false);
  const [generationMode, setGenerationMode] = useState<'FITTING' | 'COMPOSITION'>();
  const [registeredOutfitId, setRegisteredOutfitId] = useState<string>();
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>();
  const [generatingMode, setGeneratingMode] = useState<'FITTING' | 'COMPOSITION'>();

  const openRegistrationConfirm = (category: 'OOTD' | 'OUTFIT') => {
    setOutfitToRegister(selectedOutfit);
    setSelectedOutfit(undefined);
    setRegistrationCategory(category);
    setGenerationMode(undefined);
    setRegisteredOutfitId(undefined);
    setGeneratedImageUrl(undefined);
    setIsOutfitModalOpen(true);
  };

  const openGeneratedRegistration = async (mode: 'FITTING' | 'COMPOSITION') => {
    if (!registeredOutfitId) {
      toast.error('등록된 아웃핏 정보를 찾을 수 없습니다.');
      return;
    }

    setGeneratingMode(mode);
    try {
      const result = await generateOutfitImage(registeredOutfitId, mode);
      setGenerationMode(mode);
      setGeneratedImageUrl(result.imageUrl);
      setIsRegistrationConfirmOpen(false);
      setIsOutfitModalOpen(true);
    } catch (error) {
      console.error('아웃핏 이미지 생성 실패:', error);
      toast.error(`${mode === 'FITTING' ? '피팅' : '조합'} 이미지를 생성하지 못했습니다.`);
    } finally {
      setGeneratingMode(undefined);
    }
  };

  const handleRegistrationSuccess = (registeredOutfit: OutfitCreateResponse) => {
    setIsOutfitModalOpen(false);
    setRegisteredOutfitId(registeredOutfit.id);
    setIsRegistrationConfirmOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {[...Array(10)].map((_, index) => (
          <div 
            key={index}
            className="bg-[#fbfaf7] rounded-[10px] shadow-[0px_2px_7px_rgba(15,42,68,0.05)] border-[0.2px] border-[#7a8ca3] overflow-hidden animate-pulse"
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
    <div className="w-full flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="grid grid-cols-1 gap-5 p-1 xl:grid-cols-3">
        {outfits.map((outfit) => (
          <button
            key={outfit.rank}
            type="button"
            onClick={() => setSelectedOutfit(outfit)}
            className="flex flex-col gap-5 rounded-[10px] border-[0.2px] border-[#7a8ca3] bg-[#fbfaf7] p-5 text-left shadow-[0px_2px_7px_rgba(15,42,68,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#0f2a44] hover:shadow-[0px_7px_18px_rgba(15,42,68,0.10)]"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-extrabold text-[#0f2a44] text-[18px] tracking-[-0.45px]">
                  OOTD #{outfit.rank}
                </h3>
                {outfit.styleTags.length > 0 && (
                  <div className="flex max-w-[65%] gap-1 overflow-x-auto">
                    {outfit.styleTags.map((tag) => (
                      <span key={tag} className="shrink-0 rounded-full bg-[#7a8ca3]/20 px-2 py-1 font-semibold text-[#3d5570] text-[12px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {outfit.reason && (
                <p className="line-clamp-2 text-[#7a8ca3] text-[14px] leading-5">{outfit.reason}</p>
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
        onRegisterOotd={() => openRegistrationConfirm('OOTD')}
        onRegisterOutfit={() => openRegistrationConfirm('OUTFIT')}
      />
      <Dialog open={isRegistrationConfirmOpen} onOpenChange={(open) => {
        if (!open) {
          setIsRegistrationConfirmOpen(false);
          setOutfitToRegister(undefined);
          setRegisteredOutfitId(undefined);
          setGeneratedImageUrl(undefined);
        }
      }}>
        <DialogContent className="w-[680px] max-w-[calc(100%-2rem)] rounded-[12px] bg-white p-7 sm:max-w-[calc(100%-2rem)]" showCloseButton={false}>
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-[22px] font-extrabold text-[#3d5570]">{registrationCategory}에 추가하기</h2>
              <p className="mt-2 text-[15px] text-[#696975]">아래 항목도 {registrationCategory}에 추가하시겠습니까?</p>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <button type="button" disabled={Boolean(generatingMode)} onClick={() => openGeneratedRegistration('FITTING')} className="flex flex-col items-center rounded-[10px] bg-[#f7f7f8] p-3 transition-colors hover:bg-[#f2ede5] disabled:cursor-wait disabled:opacity-60">
                <div className="flex h-[180px] w-full items-center justify-center"><img src={fittingIllustration} alt="피팅 일러스트" className="h-[180px] w-full object-contain" /></div>
                <p className="mt-2 text-[13px] font-bold tracking-[0.08em] text-[#3d5570]">{generatingMode === 'FITTING' ? '생성 중...' : 'FITTING'}</p>
              </button>
              <button type="button" disabled={Boolean(generatingMode)} onClick={() => openGeneratedRegistration('COMPOSITION')} className="flex flex-col items-center rounded-[10px] bg-[#f7f7f8] p-3 transition-colors hover:bg-[#f2ede5] disabled:cursor-wait disabled:opacity-60">
                <div className="flex h-[180px] w-full items-center justify-center"><img src={compositionIllustration} alt="조합 일러스트" className="h-[150px] w-full object-contain" /></div>
                <p className="mt-2 text-[13px] font-bold tracking-[0.08em] text-[#3d5570]">{generatingMode === 'COMPOSITION' ? '생성 중...' : 'COMPOSITION'}</p>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AddOutfitModal
        open={isOutfitModalOpen}
        outfit={outfitToRegister}
        category={registrationCategory}
        generationMode={generationMode}
        generatedImageUrl={generatedImageUrl}
        onSuccess={handleRegistrationSuccess}
        onClose={() => {
          setIsOutfitModalOpen(false);
          setOutfitToRegister(undefined);
          setGenerationMode(undefined);
          setRegisteredOutfitId(undefined);
          setGeneratedImageUrl(undefined);
        }}
      />
    </div>
  );
}
