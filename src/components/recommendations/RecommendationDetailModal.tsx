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
  return (
    <Dialog open={Boolean(outfit)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] w-[760px] max-w-[calc(100%-2rem)] overflow-y-auto rounded-[12px] bg-white p-8 sm:max-w-[calc(100%-2rem)]"
        showCloseButton={false}
      >
        {outfit && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-extrabold text-[#3d5570] text-[26px] tracking-[-0.65px]">
                추천 {recommendationLabel} #{outfit.rank}
              </h2>
            </div>

            {outfit.reason && (
              <section className="rounded-[16px] bg-[#f7f7f8] p-5">
                <h3 className="font-bold text-[#33333a] text-[16px]">{recommendationLabel} 추천 이유</h3>
                <p className="mt-2 whitespace-pre-wrap text-[#575765] text-[15px] leading-6">{outfit.reason}</p>
              </section>
            )}

            {outfit.styleTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {outfit.styleTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#7a8ca3]/20 px-3 py-1.5 font-bold text-[#3d5570] text-[14px]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <section>
              <h3 className="mb-3 font-bold text-[#212126] text-[18px]">{recommendationLabel} 구성</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {outfit.clothes.map((clothes) => (
                  <div key={clothes.id} className="overflow-hidden rounded-[8px] border border-[#e7e7e9] bg-white">
                    <div className="aspect-square bg-[#f1f1f3]">
                      {clothes.imageUrl ? (
                        <img src={clothes.imageUrl} alt={clothes.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#a9a9b1] text-[13px]">이미지 없음</div>
                      )}
                    </div>
                    <div className="px-3 py-1.5">
                      <p className="truncate font-bold text-[#33333a] text-[15px]">{clothes.name}</p>
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
                    className="h-[52px] rounded-[12px] bg-[#3d5570] font-bold text-white text-[17px] transition-colors hover:bg-[#0f2a44]"
                  >
                    OOTD 등록
                  </button>
                )}
                {onRegisterOutfit && (
                  <button
                    type="button"
                    onClick={onRegisterOutfit}
                    className="h-[52px] rounded-[12px] border border-[#3d5570] bg-white font-bold text-[#3d5570] text-[17px] transition-colors hover:bg-[#f2ede5]"
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
