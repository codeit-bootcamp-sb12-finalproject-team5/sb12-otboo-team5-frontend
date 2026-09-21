import {Dialog, DialogContent} from '@/components/ui/dialog';
import type {RecommendedOutfitDto} from '@/lib/api';

interface RecommendationDetailModalProps {
  outfit?: RecommendedOutfitDto;
  onClose: () => void;
  onRegisterOotd: () => void;
  onRegisterOutfit: () => void;
}

export default function RecommendationDetailModal({
  outfit,
  onClose,
  onRegisterOotd,
  onRegisterOutfit,
}: RecommendationDetailModalProps) {
  return (
    <Dialog open={Boolean(outfit)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] w-[760px] max-w-[calc(100%-2rem)] overflow-y-auto rounded-[28px] bg-white p-8 sm:max-w-[calc(100%-2rem)]"
        showCloseButton={false}
      >
        {outfit && (
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-[#1e89f4] text-[14px]">OOTD RECOMMENDATION</p>
                <h2 className="mt-1 font-extrabold text-[#212126] text-[26px] tracking-[-0.65px]">
                  추천 코디 {outfit.rank}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[10px] bg-[#f7f7f8] px-3 py-2 font-semibold text-[#696975] text-[14px] hover:bg-[#e7e7e9]"
              >
                닫기
              </button>
            </div>

            {outfit.reason && (
              <section className="rounded-[16px] bg-[#f7f7f8] p-5">
                <h3 className="font-bold text-[#33333a] text-[16px]">이 코디를 추천한 이유</h3>
                <p className="mt-2 whitespace-pre-wrap text-[#575765] text-[15px] leading-6">{outfit.reason}</p>
              </section>
            )}

            {outfit.styleTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {outfit.styleTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#e8f3ff] px-3 py-1.5 font-bold text-[#1e89f4] text-[14px]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <section>
              <h3 className="mb-3 font-bold text-[#212126] text-[18px]">코디 구성</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {outfit.clothes.map((clothes) => (
                  <div key={clothes.id} className="overflow-hidden rounded-[16px] border border-[#e7e7e9] bg-white">
                    <div className="aspect-square bg-[#f1f1f3]">
                      {clothes.imageUrl ? (
                        <img src={clothes.imageUrl} alt={clothes.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#a9a9b1] text-[13px]">이미지 없음</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate font-bold text-[#33333a] text-[15px]">{clothes.name}</p>
                      <p className="mt-1 text-[#808089] text-[13px]">{clothes.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onRegisterOotd}
                className="h-[52px] rounded-[12px] bg-[#1e89f4] font-bold text-white text-[17px] transition-colors hover:bg-[#1479dd]"
              >
                OOTD 피드 등록
              </button>
              <button
                type="button"
                onClick={onRegisterOutfit}
                className="h-[52px] rounded-[12px] border border-[#1e89f4] bg-white font-bold text-[#1e89f4] text-[17px] transition-colors hover:bg-[#e8f3ff]"
              >
                아웃핏 등록
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
