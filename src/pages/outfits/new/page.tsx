import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import outfitRecommendationIllustration from '@/assets/illust_logos/outfit-recommendation.png';
import fittingIllustration from '@/assets/illust_logos/recommendation-fitting.png';
import compositionIllustration from '@/assets/illust_logos/recommendation-composition.png';

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
  const [isRegistrationConfirmOpen, setIsRegistrationConfirmOpen] = useState(false);
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);
  const [generationMode, setGenerationMode] = useState<'FITTING' | 'COMPOSITION'>();

  const openRegistrationConfirm = () => {
    setOutfitToRegister(selectedOutfit);
    setSelectedOutfit(undefined);
    setIsRegistrationConfirmOpen(true);
  };

  const continueRegistration = () => {
    setGenerationMode(undefined);
    setIsRegistrationConfirmOpen(false);
    setIsOutfitModalOpen(true);
  };

  const openGeneratedRegistration = (mode: 'FITTING' | 'COMPOSITION') => {
    setGenerationMode(mode);
    setIsRegistrationConfirmOpen(false);
    setIsOutfitModalOpen(true);
  };

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
    getRecommendationUsage()
      .then(response => setUsage(response.outfit))
      .catch(() => toast.error('추천 가능 횟수를 불러오지 못했습니다.'))
      .finally(() => setLoadingUsage(false));

    if (!userId) {
      setLoadingClothes(false);
      return;
    }

    getAllClothes(userId)
      .then(setClothes)
      .catch(() => toast.error('옷장을 불러오지 못했습니다.'))
      .finally(() => setLoadingClothes(false));
  };

  const requestRecommendation = async () => {
    if (!todayWeather) return;
    setLoading(true);
    try {
      const latestUsage = await getRecommendationUsage();
      setUsage(latestUsage.outfit);
      if (latestUsage.outfit.remaining <= 0) {
        toast.error('오늘 아웃핏 추천 가능 횟수를 모두 사용했습니다.');
        return;
      }

      setIsConfirmOpen(false);
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
        <Button variant="ghost" size="icon" asChild><Link to={listPath} aria-label="아웃핏 목록으로 돌아가기"><ArrowLeft className="text-[#3d5570]" /></Link></Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-bold text-gray-900">OUTFIT 추천</h1>
          <p className="mt-1 text-[14px] text-gray-500">오늘 날씨에 맞는 아웃핏을 추천해드릴게요.</p>
        </div>
        <button type="button" onClick={openRecommendation} disabled={loading} className="flex h-[44px] shrink-0 items-center gap-2 rounded-[11px] border border-[#3d5570] bg-white px-4 font-bold text-[#3d5570] hover:bg-[#f2ede5] disabled:cursor-not-allowed disabled:opacity-50">
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
        <div className="flex flex-1 -translate-y-12 flex-col items-center justify-center gap-5 py-16 text-center">
          <img src={outfitRecommendationIllustration} alt="옷걸이에 걸린 의류 일러스트" className="h-[280px] w-auto object-contain" />
          <p className="text-gray-500">내 옷장에서 고정할 옷을 고르고, 날씨에 맞는 아웃핏 3가지를 받아보세요.</p>
          <button type="button" onClick={openRecommendation} className="h-[52px] rounded-[12px] bg-[#3d5570] px-6 font-bold text-[17px] text-white hover:bg-[#0f2a44]">아웃핏 추천 받기</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-5 py-8 xl:grid-cols-3">{[1, 2, 3].map(index => <div key={index} className="h-[300px] animate-pulse rounded-[18px] bg-gray-100" />)}</div>
      ) : (
        <main className="grid grid-cols-1 gap-5 py-8 xl:grid-cols-3">
          {outfits.map(outfit => (
            <button key={outfit.rank} type="button" onClick={() => setSelectedOutfit(outfit)} className="flex flex-col gap-5 rounded-[18px] border border-[#ded6cb] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#b08a44]">
              <div><h2 className="font-extrabold text-[18px] text-[#212126]">OUTFIT #{outfit.rank}</h2>{outfit.reason && <p className="mt-2 line-clamp-2 text-[14px] leading-5 text-[#696975]">{outfit.reason}</p>}</div>
              <div className="grid grid-cols-2 gap-4">{outfit.clothes.map(item => <RecommendationItem key={item.id} item={item} />)}</div>
            </button>
          ))}
        </main>
      )}

      <RecommendationConfirmModal open={isConfirmOpen} title="아웃핏 추천 받기" showDateQuestion={false} finalRecommendationLabel="아웃핏" dateLabel={dateLabel} usage={usage} clothes={clothes} selectedClothesIds={selectedClothesIds} loadingUsage={loadingUsage} loadingClothes={loadingClothes} recommending={loading} onClose={() => setIsConfirmOpen(false)} onConfirm={requestRecommendation} onToggleClothes={setSelectedClothesIds} />
      <RecommendationDetailModal outfit={selectedOutfit} recommendationType="OUTFIT" onClose={() => setSelectedOutfit(undefined)} onRegisterOutfit={openRegistrationConfirm} />
      <Dialog open={isRegistrationConfirmOpen} onOpenChange={(open) => {
        if (!open) {
          setIsRegistrationConfirmOpen(false);
          setOutfitToRegister(undefined);
        }
      }}>
        <DialogContent className="w-[680px] max-w-[calc(100%-2rem)] rounded-[12px] bg-white p-7 sm:max-w-[calc(100%-2rem)]" showCloseButton={false}>
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-[22px] font-extrabold text-[#3d5570]">OUTFIT 등록</h2>
              <p className="mt-2 text-[15px] text-[#696975]">아래 항목을 추가해서 OUTFIT 등록을 하시겠습니까?</p>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <button type="button" onClick={() => openGeneratedRegistration('FITTING')} className="flex flex-col items-center rounded-[10px] bg-[#f7f7f8] p-3 transition-colors hover:bg-[#f2ede5]">
                <div className="flex h-[180px] w-full items-center justify-center"><img src={fittingIllustration} alt="피팅 일러스트" className="h-[180px] w-full object-contain" /></div>
                <p className="mt-2 text-[13px] font-bold tracking-[0.08em] text-[#3d5570]">FITTING</p>
              </button>
              <button type="button" onClick={() => openGeneratedRegistration('COMPOSITION')} className="flex flex-col items-center rounded-[10px] bg-[#f7f7f8] p-3 transition-colors hover:bg-[#f2ede5]">
                <div className="flex h-[180px] w-full items-center justify-center"><img src={compositionIllustration} alt="조합 일러스트" className="h-[150px] w-full object-contain" /></div>
                <p className="mt-2 text-[13px] font-bold tracking-[0.08em] text-[#3d5570]">COMPOSITION</p>
              </button>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={continueRegistration} className="h-[36px] rounded-[8px] bg-[#3d5570] px-5 text-[14px] font-bold text-white hover:bg-[#0f2a44]">추가하지 않고 등록</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AddOutfitModal open={isOutfitModalOpen} outfit={outfitToRegister} category="OUTFIT" generationMode={generationMode} onClose={() => { setIsOutfitModalOpen(false); setOutfitToRegister(undefined); setGenerationMode(undefined); }} />
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
