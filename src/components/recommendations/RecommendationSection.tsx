import {useEffect} from 'react';
import RecommendationHeader from './RecommendationHeader';
import RecommendationGrid from './RecommendationGrid';
import {useRecommendationStore} from "@/lib/stores/useRecommendationStore.ts";
import {useWeatherStore} from "@/lib/stores/useWeatherStore.ts";
import {useAuthStore} from '@/lib/stores/useAuthStore';
import {loadRecommendationSession} from '@/lib/recommendationSession';

export default function RecommendationSection() {
  const { selectedWeather } = useWeatherStore();
  const userId = useAuthStore(state => state.data?.userDto.id);
  const { data: recommendations, loading, setWeatherId, restore } = useRecommendationStore();

  useEffect(() => {
    if (selectedWeather?.id) {
      setWeatherId(selectedWeather.id);
      if (userId) {
        const cachedRecommendation = loadRecommendationSession('ootd', userId, selectedWeather.id);
        if (cachedRecommendation) restore(selectedWeather.id, cachedRecommendation);
      }
    }
  }, [selectedWeather?.id, setWeatherId, restore, userId]);

  // selectedWeather가 없으면 추천 섹션을 렌더링하지 않음
  if (!selectedWeather) {
    return null;
  }

  const hasClothes = Boolean(recommendations?.outfits.some(outfit => outfit.clothes.length > 0));

  return (
    <div className="relative w-full px-[52px] h-full pb-8">
      <div className="bg-[#fdfdfa] rounded-[22px] border border-[#ded6cb] box-border content-stretch flex flex-col gap-[34px] px-[40px] items-start justify-start py-8 relative w-full h-full shadow-[0px_8px_24px_rgba(15,42,68,0.06)]">
        {loading || hasClothes ? (
            <>
              <RecommendationHeader/>
              <RecommendationGrid/>
            </>
        ) : (
          <RecommendationHeader centered />
        )}
      </div>
    </div>
  );
}
