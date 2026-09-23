import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import RecommendationConfirmModal from '@/components/recommendations/RecommendationConfirmModal';
import RecommendationDetailModal from '@/components/recommendations/RecommendationDetailModal';
import RecommendationItem from '@/components/recommendations/RecommendationItem';
import AddOutfitModal from '@/components/recommendations/AddOutfitModal';
import { getClothes } from '@/lib/api/clothes';
import { getOutfitRecommendation, getRecommendationUsage } from '@/lib/api/recommendations';
import { getProfileWeather } from '@/lib/api/weather';
import type { ClothesDto, RecommendationDto, RecommendationUsage, RecommendedOutfitDto, WeatherDto } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import {loadRecommendationSession, saveRecommendationSession} from '@/lib/recommendationSession';

export default function NewOutfitPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') ?? 'OOTD';
  const listPath = `/outfits?${new URLSearchParams({ category })}`;
  const userId = useAuthStore(state => state.data?.userDto.id);
  const [todayWeather, setTodayWeather] = useState<WeatherDto>();
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendationDto>();
  const [usage, setUsage] = useState<RecommendationUsage>();
  const [clothes, setClothes] = useState<ClothesDto[]>([]);
  const [selectedClothesIds, setSelectedClothesIds] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [loadingClothes, setLoadingClothes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<RecommendedOutfitDto>();
  const [outfitToRegister, setOutfitToRegister] = useState<RecommendedOutfitDto>();

  useEffect(() => {
    if (!userId) return;
    setLoadingWeather(true);
    getProfileWeather(userId)
      .then((weathers) => setTodayWeather(weathers.find(weather => isToday(weather.forecastAt))))
      .catch((error) => console.error('오늘 날씨 조회 실패:', error))
      .finally(() => setLoadingWeather(false));
  }, [userId]);

  useEffect(() => {
    if (!userId || !todayWeather?.id) return;
    const cachedRecommendation = loadRecommendationSession('outfit', userId, todayWeather.id);
    if (cachedRecommendation) setRecommendations(cachedRecommendation);
  }, [todayWeather?.id, userId]);

  const openRecommendation = async () => {
    if (!todayWeather) {
      toast.error('오늘 날씨 정보를 불러온 뒤 다시 시도해주세요.');
      return;
    }

    setIsConfirmOpen(true);
    setLoadingUsage(true);
    setLoadingClothes(true);
    setUsage(undefined);
    setClothes([]);
    setSelectedClothesIds([]);
    const [usageResult, clothesResult] = await Promise.allSettled([
      getRecommendationUsage(),
      userId ? getAllClothes(userId) : Promise.resolve([]),
    ]);
    if (usageResult.status === 'fulfilled') setUsage(usageResult.value.outfit);
    else toast.error('추천 가능 횟수를 불러오지 못했습니다.');
    if (clothesResult.status === 'fulfilled') setClothes(clothesResult.value);
    else toast.error('옷장을 불러오지 못했습니다.');
    setLoadingUsage(false);
    setLoadingClothes(false);
  };

  const requestRecommendation = async () => {
    if (!todayWeather) return;
    setIsConfirmOpen(false);
    setLoading(true);
    try {
      const result = await getOutfitRecommendation({weatherId: todayWeather.id, selectedClothesIds});
      setRecommendations(result);
      if (userId) saveRecommendationSession('outfit', userId, todayWeather.id, result);
    } catch (error) {
      console.error('아웃핏 추천 요청 실패:', error);
      toast.error('아웃핏 추천을 받지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const outfits = recommendations?.outfits.filter(outfit => outfit.clothes.length > 0) ?? [];
  const dateLabel = todayWeather ? formatDate(todayWeather.forecastAt) : '오늘';

  return (
    <div className="flex h-full flex-col overflow-y-auto px-10 py-2.5">
      <header className="flex shrink-0 items-center gap-4 border-b border-gray-200 py-4">
        <Button variant="ghost" size="icon" asChild><Link to={listPath} aria-label="아웃핏 목록으로 돌아가기"><ArrowLeft /></Link></Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-bold text-gray-900">아웃핏 제작</h1>
          <p className="mt-1 text-[14px] text-gray-500">오늘 날씨에 맞는 아웃핏을 추천해드릴게요.</p>
        </div>
        <button type="button" onClick={openRecommendation} disabled={loading} className="flex h-[44px] shrink-0 items-center gap-2 rounded-[11px] border border-[#1e89f4] bg-white px-4 font-bold text-[#1e89f4] hover:bg-[#e8f3ff] disabled:cursor-not-allowed disabled:opacity-50">
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '추천 중...' : outfits.length > 0 ? '다른 아웃핏 추천' : '아웃핏 추천 받기'}
        </button>
      </header>

      {loadingWeather ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
          <h2 className="text-xl font-bold text-gray-800">오늘 날씨를 불러오는 중이에요</h2>
        </div>
      ) : !todayWeather ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
          <h2 className="text-xl font-bold text-gray-800">오늘 날씨 정보를 찾을 수 없어요</h2>
          <p className="text-gray-500">프로필 위치를 확인한 뒤 다시 시도해주세요.</p>
        </div>
      ) : outfits.length === 0 && !loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-16 text-center">
          <p className="text-gray-500">내 옷장에서 고정할 옷을 고르고, 날씨에 맞는 아웃핏 3가지를 받아보세요.</p>
          <button type="button" onClick={openRecommendation} className="h-[52px] rounded-[12px] bg-[#1e89f4] px-6 font-bold text-[17px] text-white hover:bg-[#1479dd]">아웃핏 추천 받기</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-5 py-8 xl:grid-cols-3">{[1, 2, 3].map(index => <div key={index} className="h-[300px] animate-pulse rounded-[18px] bg-gray-100" />)}</div>
      ) : (
        <main className="grid grid-cols-1 gap-5 py-8 xl:grid-cols-3">
          {outfits.map(outfit => (
            <button key={outfit.rank} type="button" onClick={() => setSelectedOutfit(outfit)} className="flex flex-col gap-5 rounded-[18px] border border-[#e7e7e9] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#1e89f4]">
              <div><h2 className="font-extrabold text-[18px] text-[#212126]">추천 아웃핏 {outfit.rank}</h2>{outfit.reason && <p className="mt-2 line-clamp-2 text-[14px] leading-5 text-[#696975]">{outfit.reason}</p>}</div>
              <div className="grid grid-cols-2 gap-4">{outfit.clothes.map(item => <RecommendationItem key={item.id} item={item} />)}</div>
            </button>
          ))}
        </main>
      )}

      <RecommendationConfirmModal open={isConfirmOpen} title="아웃핏 추천 받기" showDateQuestion={false} finalRecommendationLabel="아웃핏" dateLabel={dateLabel} usage={usage} clothes={clothes} selectedClothesIds={selectedClothesIds} loadingUsage={loadingUsage} loadingClothes={loadingClothes} recommending={loading} onClose={() => setIsConfirmOpen(false)} onConfirm={requestRecommendation} onToggleClothes={setSelectedClothesIds} />
      <RecommendationDetailModal outfit={selectedOutfit} recommendationType="OUTFIT" onClose={() => setSelectedOutfit(undefined)} onRegisterOutfit={() => { setOutfitToRegister(selectedOutfit); setSelectedOutfit(undefined); }} />
      <AddOutfitModal open={Boolean(outfitToRegister)} outfit={outfitToRegister} onClose={() => setOutfitToRegister(undefined)} />
    </div>
  );
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

function formatDate(dateTime: string) {
  const date = new Date(dateTime);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function isToday(dateTime: string) {
  const date = new Date(dateTime);
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}
