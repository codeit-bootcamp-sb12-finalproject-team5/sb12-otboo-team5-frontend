import {Dialog, DialogContent} from '@/components/ui/dialog';
import type {RecommendedOutfitDto} from '@/lib/api';

interface RecommendationDetailModalProps {
  outfit?: RecommendedOutfitDto;
  onClose: () => void;
  onRegisterOotd?: () => void;
  onRegisterOutfit?: () => void;
  recommendationType?: 'OOTD' | 'OUTFIT';
}

export default function RecommendationDetailModal({
  outfit,
  onClose,
  onRegisterOotd,
  onRegisterOutfit,
  recommendationType = 'OOTD',
}: RecommendationDetailModalProps) {
  const recommendationLabel = recommendationType === 'OUTFIT' ? 'OUTFIT' : 'OOTD';
  const isOutfitRecommendation = recommendationType === 'OUTFIT';
  return (
    <Dialog open={Boolean(outfit)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`${isOutfitRecommendation ? 'max-h-[calc(100vh-4rem)] w-[640px] p-6' : 'max-h-[calc(100vh-2rem)] w-[760px] p-8'} max-w-[calc(100%-2rem)] overflow-y-auto rounded-[12px] bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-[calc(100%-2rem)]`}
        showCloseButton={false}
      >
        {outfit && (
          <div className={`flex flex-col ${isOutfitRecommendation ? 'gap-5' : 'gap-6'}`}>
            <div>
              <h2 className={`${isOutfitRecommendation ? 'text-[23px]' : 'text-[26px]'} font-extrabold tracking-[-0.65px] text-[#3d5570]`}>
                추천 {recommendationLabel} #{outfit.rank}
              </h2>
            </div>

            {outfit.reason && (
              <section className={`rounded-[16px] bg-[#f7f7f8] ${isOutfitRecommendation ? 'p-4' : 'p-5'}`}>
                <h3 className="font-bold text-[#33333a] text-[16px]">{recommendationLabel} 추천 이유</h3>
                <p className={`${isOutfitRecommendation ? 'mt-1 text-[14px] leading-5' : 'mt-2 text-[15px] leading-6'} whitespace-pre-wrap text-[#575765]`}>{outfit.reason}</p>
              </section>
            )}

            {outfit.styleTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {outfit.styleTags.map((tag) => (
                  <span key={tag} className={`rounded-full bg-[#7a8ca3]/20 px-3 ${isOutfitRecommendation ? 'py-1 text-[13px]' : 'py-1.5 text-[14px]'} font-bold text-[#3d5570]`}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <section>
              <h3 className={`${isOutfitRecommendation ? 'mb-2 text-[17px]' : 'mb-3 text-[18px]'} font-bold text-[#212126]`}>{recommendationLabel} 구성</h3>
              <div className={`grid grid-cols-2 ${isOutfitRecommendation ? 'gap-3' : 'gap-4'} sm:grid-cols-3`}>
                {outfit.clothes.map((clothes) => (
                  <div key={clothes.id} className="overflow-hidden rounded-[8px] border border-[#e7e7e9] bg-white">
                    <div className="aspect-square bg-[#f1f1f3]">
                      {clothes.imageUrl ? (
                        <img src={clothes.imageUrl} alt={clothes.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#a9a9b1] text-[13px]">이미지 없음</div>
                      )}
                    </div>
                    <div className={`px-3 ${isOutfitRecommendation ? 'py-1' : 'py-1.5'}`}>
                      <p className={`${isOutfitRecommendation ? 'text-[14px]' : 'text-[15px]'} truncate font-bold text-[#33333a]`}>{clothes.name}</p>
                      <p className="mt-0.5 text-[#808089] text-[13px]">{clothes.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {(onRegisterOotd || onRegisterOutfit) && (
              <div className={`grid gap-3 ${onRegisterOotd && onRegisterOutfit ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {onRegisterOotd && (
                  <button
                    type="button"
                    onClick={onRegisterOotd}
                    className={`${isOutfitRecommendation ? 'h-[38px] text-[15px]' : 'h-[44px] text-[17px]'} rounded-[12px] bg-[#3d5570] font-bold text-white transition-colors hover:bg-[#0f2a44]`}
                  >
                    OOTD 등록
                  </button>
                )}
                {onRegisterOutfit && (
                  <button
                    type="button"
                    onClick={onRegisterOutfit}
                    className={`${isOutfitRecommendation ? 'h-[38px] text-[15px]' : 'h-[44px] text-[17px]'} rounded-[12px] border border-[#3d5570] bg-white font-bold text-[#3d5570] transition-colors hover:bg-[#f2ede5]`}
                  >
                    OUTFIT 등록
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
