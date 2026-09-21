import {useEffect} from 'react';
import CurrentWeather from './CurrentWeather';
import WeatherForecast from './WeatherForecast';
import {useMyProfileStore} from '@/lib/stores/useMyProfileStore';
import useGeoLocation from "@/hooks/useGeoLocation.ts";
import type {SkyStatus} from "@/lib/api";
import {useWeatherStore} from "@/lib/stores/useWeatherStore.ts";
import ilBgSunny from '@/assets/illust_logos/il_bg_sunny.svg';
import ilBgCloudy from '@/assets/illust_logos/il_bg_cloudy.svg';
import ilBgOvercast from '@/assets/illust_logos/il_bg_overcast.svg';
import { getProfileWeather } from '@/lib/api/weather';

export default function WeatherSection() {
  const { location, refetchLocation } = useGeoLocation();
  const { updateParams, selectedWeather, setData } = useWeatherStore();
  const { data: profile } = useMyProfileStore();

  useEffect(() => {
    if (location) {
      updateParams({ ...location });
    }
  }, [location, updateParams]);

  useEffect(() => {
    if (!profile?.userId) {
      return;
    }

    getProfileWeather(profile.userId)
    .then((weather) => {
      setData(weather);
    })
    .catch((error) => {
      console.error('Profile 날씨 조회 실패:', error);
    });
  }, [profile?.userId, setData]);

  const getBackgroundImage = (skyStatus?: SkyStatus) => {
    switch (skyStatus) {
      case 'CLEAR':
        return ilBgSunny;
      case 'MOSTLY_CLOUDY':
        return ilBgCloudy;
      case 'CLOUDY':
        return ilBgOvercast;
      default:
        return undefined;
    }
  };

  return (
    <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start px-[100px] py-0 relative w-full z-10 mb-5">
      {/* 배경 이미지 */}
      {
          selectedWeather && (
              <img
                  src={getBackgroundImage(selectedWeather?.skyStatus)}
                  alt="날씨 배경"
                  className="absolute right-0 top-0 w-[300px] h-[300px] object-cover pointer-events-none z-[-1]"
              />
          )
      }

      {/* CurrentWeather에 위치 정보를 props로 전달 */}
      <CurrentWeather
          fetchLocation={refetchLocation}
          locationNames={profile?.locationNames}
      />
      {/* WeatherForecast에 위치 정보를 props로 전달 */}
      <WeatherForecast/>
    </div>
  );
}