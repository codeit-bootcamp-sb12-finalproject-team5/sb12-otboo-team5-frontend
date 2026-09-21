import {Dialog, DialogContent} from '@/components/ui/dialog';
import type {RecommendationUsage} from '@/lib/api';

interface RecommendationConfirmModalProps {
  open: boolean;
  dateLabel: string;
  usage?: RecommendationUsage;
  loadingUsage: boolean;
  recommending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RecommendationConfirmModal({
  open,
  dateLabel,
  usage,
  loadingUsage,
  recommending,
  onClose,
  onConfirm,
}: RecommendationConfirmModalProps) {
  const unavailable = !usage || usage.remaining <= 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="bg-white box-border flex flex-col gap-6 p-[30px] rounded-[30px] w-[460px] max-w-[calc(100%-2rem)]"
        showCloseButton={false}
      >
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-[#212126] text-[22px] tracking-[-0.55px]">
            OOTD 추천 받기
          </h2>
          <p className="font-semibold text-[#575765] text-[17px] tracking-[-0.4px]">
            {dateLabel} 옷 추천을 받겠습니까?
          </p>
        </div>

        <div className="bg-[#f7f7f8] rounded-[12px] px-5 py-4 text-[#575765]">
          {loadingUsage ? (
            <p className="font-semibold">추천 가능 횟수를 확인하고 있습니다.</p>
          ) : usage ? (
            <div className="flex flex-col gap-1 font-semibold">
              <p>오늘 추천 가능 횟수: {usage.limit}회</p>
              <p>오늘 남은 추천 횟수: {usage.remaining}회</p>
            </div>
          ) : (
            <p className="font-semibold">추천 가능 횟수를 불러오지 못했습니다.</p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={recommending}
            className="bg-[#f7f7f8] h-[46px] px-[18px] rounded-[12px] font-bold text-[#575765] text-[18px] disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loadingUsage || unavailable || recommending}
            className="bg-[#1e89f4] h-[46px] px-[18px] rounded-[12px] font-bold text-white text-[18px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {recommending ? '추천 중...' : '추천받기'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
