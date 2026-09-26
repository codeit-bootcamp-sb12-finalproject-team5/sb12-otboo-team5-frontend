import { useState } from 'react';
import hangerIcon from '@/assets/icons/il_hanger.svg';
import refreshIcon from '@/assets/icons/ic_refresh.svg';
import wardrobeIllustration from '@/assets/illust_logos/recommendation-wardrobe.png';
import {useRecommendationStore} from "@/lib/stores/useRecommendationStore.ts";
import {useWeatherStore} from '@/lib/stores/useWeatherStore';
import {getRecommendationUsage} from '@/lib/api/recommendations';
import {getClothes} from '@/lib/api/clothes';
import {useAuthStore} from '@/lib/stores/useAuthStore';
import RecommendationConfirmModal from './RecommendationConfirmModal';
import type {ClothesDto, RecommendationUsage} from "@/lib/api";
import {toast} from 'sonner';
import {saveRecommendationSession} from '@/lib/recommendationSession';

interface RecommendationHeaderProps {
  centered?: boolean;
}

export default function RecommendationHeader({centered = false}: RecommendationHeaderProps) {
  const {data: recommendation, loading, fetch, setSelectedClothesIds: setRecommendationSelectedClothesIds} = useRecommendationStore();
  const {selectedWeather} = useWeatherStore();
  const {data: auth} = useAuthStore();
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [usage, setUsage] = useState<RecommendationUsage>();
  const [clothes, setClothes] = useState<ClothesDto[]>([]);
  const [selectedClothesIds, setSelectedClothesIds] = useState<string[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [loadingClothes, setLoadingClothes] = useState(false);
  const [checkingUsage, setCheckingUsage] = useState(false);

  const handleOpenRecommendationModal = async () => {
    setIsRecommendationModalOpen(true);
    setLoadingUsage(true);
    setLoadingClothes(true);
    setUsage(undefined);
    setClothes([]);
    setSelectedClothesIds([]);

    getRecommendationUsage()
      .then(response => setUsage(response.ootd))
      .catch(error => {
        console.error('추천 사용량 조회 실패:', error);
        toast.error('추천 가능 횟수를 불러오지 못했습니다.');
      })
      .finally(() => setLoadingUsage(false));

    if (!auth?.userDto.id) {
      setLoadingClothes(false);
      return;
    }

    getAllClothes(auth.userDto.id)
      .then(setClothes)
      .catch(error => {
        console.error('옷장 조회 실패:', error);
        toast.error('옷장을 불러오지 못했습니다.');
      })
      .finally(() => setLoadingClothes(false));
  };

  const handleConfirmRecommendation = async () => {
    setCheckingUsage(true);
    try {
      const latestUsage = await getRecommendationUsage();
      setUsage(latestUsage.ootd);
      if (latestUsage.ootd.remaining <= 0) {
        toast.error('오늘 OOTD 추천 가능 횟수를 모두 사용했습니다.');
        return;
      }

      setIsRecommendationModalOpen(false);
      setRecommendationSelectedClothesIds(selectedClothesIds);
      await fetch({throwError: true});
      const result = useRecommendationStore.getState().data;
      if (result && auth?.userDto.id && selectedWeather?.id) {
        saveRecommendationSession('ootd', auth.userDto.id, selectedWeather.id, result);
      }
    } catch (error) {
      console.error('OOTD 추천 요청 실패:', error);
      toast.error('OOTD 추천을 받지 못했습니다.');
    } finally {
      setCheckingUsage(false);
    }
  }

  const hasRecommendation = Boolean(recommendation?.outfits.some(outfit => outfit.clothes.length > 0));
  const selectedDayLabel = selectedWeather ? getSelectedDayLabel(selectedWeather.forecastAt) : '오늘';
  const recommendationMessage = selectedWeather
    ? `${isToday(selectedWeather.forecastAt) ? '오늘' : formatDate(selectedWeather.forecastAt)} 날씨에 맞는 옷을 추천해드릴게요`
    : '';
  const recommendationModal = (
    <RecommendationConfirmModal
      open={isRecommendationModalOpen}
      dateLabel={selectedWeather ? getRecommendationDateLabel(selectedWeather.forecastAt) : ''}
      usage={usage}
      clothes={clothes}
      selectedClothesIds={selectedClothesIds}
      loadingUsage={loadingUsage}
      loadingClothes={loadingClothes}
      recommending={loading || checkingUsage}
      onClose={() => setIsRecommendationModalOpen(false)}
      onConfirm={handleConfirmRecommendation}
      onToggleClothes={setSelectedClothesIds}
    />
  );

  if (centered) {
    return (
      <section className="flex min-h-[620px] w-full flex-col items-center justify-center py-6 text-center">
        <header>
          <h2 className="font-serif text-[38px] font-semibold tracking-[-0.05em] text-[#0f2a44] sm:text-[44px]">{selectedDayLabel} OOTD 추천</h2>
          <p className="mt-2 text-[16px] font-semibold tracking-[-0.4px] text-[#7a8ca3]">날씨에 맞는 스타일링을 <span className="underline decoration-[#ded6cb] decoration-1 underline-offset-4">내 옷장</span>에서 추천해드려요.</p>
        </header>

        <img src={wardrobeIllustration} alt="옷장 속 다양한 의류 일러스트" className="mt-5 h-[250px] w-full max-w-[560px] object-contain" />
        <p className="-mt-2 text-[16px] font-semibold tracking-[-0.4px] text-[#7a8ca3]">버튼을 눌러 날씨에 맞는 OOTD를 추천받아보세요.</p>

        <div className="mt-6 border-t border-[#e5ddd2] pt-5">
          <button
            className="flex h-[52px] min-w-[290px] items-center justify-center gap-2 rounded-[10px] bg-[#0f2a44] px-6 font-bold text-[18px] text-white transition-colors hover:bg-[#3d5570] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleOpenRecommendationModal}
            disabled={loading}
          >
            {loading ? '추천 중...' : 'OOTD 추천 받기'}
            <img alt="" className="size-5 brightness-0 invert" src={refreshIcon} />
          </button>
          <p className="mt-3 text-[13px] font-medium text-[#7a8ca3]">추천 결과는 매번 새롭게 제안돼요.</p>
        </div>
        {recommendationModal}
      </section>
    );
  }

  return (
    <div className="content-stretch flex items-center justify-between relative w-full">
      {/* 헤더 섹션 */}
      <div className="content-stretch flex flex-col gap-1 items-start justify-center relative shrink-0">
        <div className="content-stretch flex gap-2 items-center justify-start relative shrink-0">
          <div className="overflow-clip relative shrink-0 size-6">
            <img alt="옷걸이" className="block max-w-none size-full" src={hangerIcon} />
          </div>
          <div className="font-extrabold leading-none not-italic relative shrink-0 text-[#0f2a44] text-[24px] text-nowrap tracking-[-0.6px]">
            <p className="leading-normal whitespace-pre">#추천 OOTD</p>
          </div>
        </div>
        {hasRecommendation && (
          <div className="font-semibold leading-none not-italic relative shrink-0 text-[#7a8ca3] text-[18px] text-nowrap tracking-[-0.45px]">
            <p className="leading-normal whitespace-pre">{recommendationMessage}</p>
          </div>
        )}
      </div>

      {/* 버튼 섹션 */}
      <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0">
        {/* OOTD 추천 요청 버튼 */}
        <button
          className="bg-[#fbfaf7] box-border content-stretch flex gap-1.5 h-[46px] items-center justify-center px-[18px] py-2.5 relative rounded-[10px] shrink-0 hover:bg-[#f2ede5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#b7a997] shadow-[0px_2px_6px_rgba(15,42,68,0.05)]"
          onClick={handleOpenRecommendationModal}
          disabled={loading}
        >
          <div className="font-semibold leading-none not-italic relative shrink-0 text-[#3d5570] text-[16px] text-nowrap tracking-[-0.4px]">
            <p className="leading-normal whitespace-pre">
              {loading ? '추천 중...' : hasRecommendation ? '다른 옷 추천' : 'OOTD 추천 받기'}
            </p>
          </div>
          <img alt="새로고침" className="size-5" src={refreshIcon} />
        </button>

      </div>

      {recommendationModal}
    </div>
  );
}

function isToday(dateTime: string) {
  const date = new Date(dateTime);
  const today = new Date();

  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function formatDate(dateTime: string) {
  const date = new Date(dateTime);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getSelectedDayLabel(dateTime: string) {
  const selectedDate = new Date(dateTime);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfSelected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const dayDifference = Math.round((startOfSelected.getTime() - startOfToday.getTime()) / 86_400_000);

  if (dayDifference <= 0) return '오늘의';
  if (dayDifference === 1) return '내일';
  if (dayDifference === 2) return '모레';
  return `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;
}

function getRecommendationDateLabel(dateTime: string) {
  const selectedDate = new Date(dateTime);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfSelected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const dayDifference = Math.round((startOfSelected.getTime() - startOfToday.getTime()) / 86_400_000);

  if (dayDifference <= 0) return '오늘';
  if (dayDifference === 1) return '내일';
  if (dayDifference === 2) return '모레';
  return formatDate(dateTime);
}

async function getAllClothes(ownerId: string) {
  const clothes: ClothesDto[] = [];
  let cursor: string | undefined;
  let idAfter: string | undefined;
  let hasNext = true;

  while (hasNext) {
    const response = await getClothes({ownerId, limit: 100, cursor, idAfter});
    clothes.push(...response.data);
    cursor = response.nextCursor;
    idAfter = response.nextIdAfter;
    hasNext = response.hasNext;
  }

  return clothes;
}
