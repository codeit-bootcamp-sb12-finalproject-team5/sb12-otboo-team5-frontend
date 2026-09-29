import type { OutfitDto, PrecipitationType, SkyStatus } from '@/lib/api/types';
import sunnyIcon from '@/assets/illust_logos/il_Sunny.svg';
import overcastIcon from '@/assets/illust_logos/il_Overcast.svg';
import cloudyIcon from '@/assets/illust_logos/il_cloudy.svg';

interface OutfitWeatherProps {
  weather: NonNullable<OutfitDto['weather']>;
  compact?: boolean;
}

const skyLabels: Record<SkyStatus, string> = {
  CLEAR: '맑음',
  MOSTLY_CLOUDY: '구름 많음',
  CLOUDY: '흐림',
};

const skyIcons: Record<SkyStatus, string> = {
  CLEAR: sunnyIcon,
  MOSTLY_CLOUDY: cloudyIcon,
  CLOUDY: overcastIcon,
};

const precipitationLabels: Record<PrecipitationType, string> = {
  NONE: '없음',
  RAIN: '비',
  RAIN_SNOW: '비/눈',
  SNOW: '눈',
  SHOWER: '소나기',
};

export default function OutfitWeather({ weather, compact = false }: OutfitWeatherProps) {
  const { skyStatus, temperature, precipitation } = weather;
  const skyLabel = skyLabels[skyStatus] ?? skyStatus;
  const precipitationLabel = precipitationLabels[precipitation.type] ?? precipitation.type;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-semibold text-[#808089]">
        <img src={skyIcons[skyStatus] ?? sunnyIcon} alt="" className="size-5" />
        <span>{Math.round(temperature.current)}°C</span>
        <span>{skyLabel}</span>
      </div>
    );
  }

  return (
    <section aria-label="아웃핏 날씨" className="rounded-2xl bg-[#f7f7f8] p-4">
      <h3 className="text-sm font-bold text-[#808089]">날씨</h3>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <img src={skyIcons[skyStatus] ?? sunnyIcon} alt="" className="size-10" />
        <p className="text-3xl font-bold tracking-tight text-[#373740]">
          {Math.round(temperature.current)}°C
        </p>
        <p className="text-sm font-semibold text-[#64646f]">{skyLabel}</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-[#808089]">최저 / 최고</dt>
          <dd className="mt-1 font-semibold text-[#373740]">
            {Math.round(temperature.min)}° / {Math.round(temperature.max)}°
          </dd>
        </div>
        <div>
          <dt className="text-[#808089]">전날 대비</dt>
          <dd className="mt-1 font-semibold text-[#373740]">
            {temperature.comparedToDayBefore > 0 ? '+' : ''}
            {temperature.comparedToDayBefore}°
          </dd>
        </div>
        <div>
          <dt className="text-[#808089]">강수</dt>
          <dd className="mt-1 font-semibold text-[#373740]">
            {precipitationLabel} · {precipitation.amount}mm
          </dd>
        </div>
        <div>
          <dt className="text-[#808089]">강수 확률</dt>
          <dd className="mt-1 font-semibold text-[#373740]">
            {Math.round(precipitation.probability)}%
          </dd>
        </div>
      </dl>
    </section>
  );
}
