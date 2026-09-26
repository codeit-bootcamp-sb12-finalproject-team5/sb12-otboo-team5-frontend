import {useEffect} from 'react';
import CurrentWeather from './CurrentWeather';
import WeatherForecast from './WeatherForecast';
import {useMyProfileStore} from '@/lib/stores/useMyProfileStore';
import useGeoLocation from "@/hooks/useGeoLocation.ts";
import {useWeatherStore} from "@/lib/stores/useWeatherStore.ts";
import { getProfileWeather } from '@/lib/api/weather';

export default function WeatherSection() {
  const { location, refetchLocation } = useGeoLocation();
  const { updateParams, setData } = useWeatherStore();
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

  return (
    <div className="box-border content-stretch flex flex-col gap-6 items-start justify-start px-[52px] py-2 relative w-full z-10 mb-4">
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
