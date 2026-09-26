import WeatherSection from '@/components/recommendations/WeatherSection';
import RecommendationSection from '@/components/recommendations/RecommendationSection';

export default function RecommendationsPage() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-32 bottom-4 h-[300px] w-[520px] rotate-[10deg] rounded-[50%] border border-[#b7a997]/35" />
      {/* 날씨 섹션 */}
      <div className="flex-shrink-0">
        <WeatherSection />
      </div>
      
      {/* 추천 섹션 */}
      <div className="flex-1 min-h-0">
        <RecommendationSection />
      </div>
    </div>
  );
}
