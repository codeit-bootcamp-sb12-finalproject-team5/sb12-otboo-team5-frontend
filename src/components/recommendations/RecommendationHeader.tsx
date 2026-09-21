import { useState } from 'react';
import hangerIcon from '@/assets/icons/il_hanger.svg';
import refreshIcon from '@/assets/icons/ic_refresh.svg';
import {useRecommendationStore} from "@/lib/stores/useRecommendationStore.ts";
import {useWeatherStore} from '@/lib/stores/useWeatherStore';
import {getRecommendationUsage} from '@/lib/api/recommendations';
import {getClothes} from '@/lib/api/clothes';
import {useAuthStore} from '@/lib/stores/useAuthStore';
import RecommendationConfirmModal from './RecommendationConfirmModal';
import type {ClothesDto, RecommendationUsage} from "@/lib/api";
import {toast} from 'sonner';

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

  const handleOpenRecommendationModal = async () => {
    setIsRecommendationModalOpen(true);
    setLoadingUsage(true);
    setLoadingClothes(true);
    setUsage(undefined);
    setClothes([]);
    setSelectedClothesIds([]);

    const [usageResult, clothesResult] = await Promise.allSettled([
      getRecommendationUsage(),
      auth?.userDto.id ? getAllClothes(auth.userDto.id) : Promise.resolve(null),
    ]);

    if (usageResult.status === 'fulfilled') {
      setUsage(usageResult.value.ootd);
    } else {
      console.error('추천 사용량 조회 실패:', usageResult.reason);
      toast.error('추천 가능 횟수를 불러오지 못했습니다.');
    }

    if (clothesResult.status === 'fulfilled' && clothesResult.value) {
      setClothes(clothesResult.value);
    } else if (clothesResult.status === 'rejected') {
      console.error('옷장 조회 실패:', clothesResult.reason);
      toast.error('옷장을 불러오지 못했습니다.');
    }

    setLoadingUsage(false);
    setLoadingClothes(false);
  };

  const handleConfirmRecommendation = async () => {
    setIsRecommendationModalOpen(false);

    try {
      setRecommendationSelectedClothesIds(selectedClothesIds);
      await fetch({throwError: true});
    } catch (error) {
      console.error('OOTD 추천 요청 실패:', error);
      toast.error('OOTD 추천을 받지 못했습니다.');
    }
  }

  const hasRecommendation = Boolean(recommendation?.outfits.some(outfit => outfit.clothes.length > 0));
  const recommendationMessage = selectedWeather
    ? `${isToday(selectedWeather.forecastAt) ? '오늘' : formatDate(selectedWeather.forecastAt)} 날씨에 맞는 옷을 추천해드릴게요`
    : '';
  const recommendationModal = (
    <RecommendationConfirmModal
      open={isRecommendationModalOpen}
      dateLabel={selectedWeather ? formatDate(selectedWeather.forecastAt) : ''}
      usage={usage}
      clothes={clothes}
      selectedClothesIds={selectedClothesIds}
      loadingUsage={loadingUsage}
      loadingClothes={loadingClothes}
      recommending={loading}
      onClose={() => setIsRecommendationModalOpen(false)}
      onConfirm={handleConfirmRecommendation}
      onToggleClothes={setSelectedClothesIds}
    />
  );

  if (centered) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <button
          className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] bg-[#1e89f4] px-6 font-bold text-[18px] text-white transition-colors hover:bg-[#1479dd] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleOpenRecommendationModal}
          disabled={loading}
        >
          {loading ? '추천 중...' : 'OOTD 추천 받기'}
          <img alt="" className="size-5 brightness-0 invert" src={refreshIcon} />
        </button>
        {recommendationModal}
      </div>
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
          <div className="font-extrabold leading-none not-italic relative shrink-0 text-[#212126] text-[24px] text-nowrap tracking-[-0.6px]">
            <p className="leading-normal whitespace-pre">#추천 OOTD</p>
          </div>
        </div>
        {hasRecommendation && (
          <div className="font-semibold leading-none not-italic relative shrink-0 text-[#808089] text-[18px] text-nowrap tracking-[-0.45px]">
            <p className="leading-normal whitespace-pre">{recommendationMessage}</p>
          </div>
        )}
      </div>

      {/* 버튼 섹션 */}
      <div className="content-stretch flex gap-3 items-center justify-start relative shrink-0">
        {/* OOTD 추천 요청 버튼 */}
        <button
          className="bg-white box-border content-stretch flex gap-1.5 h-[46px] items-center justify-center px-[18px] py-2.5 relative rounded-[12px] shrink-0 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#d4d4d9] shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)]"
          onClick={handleOpenRecommendationModal}
          disabled={loading}
        >
          <div className="font-semibold leading-none not-italic relative shrink-0 text-[#696975] text-[16px] text-nowrap tracking-[-0.4px]">
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
