import { apiClient } from './client';
import type {
  RecommendationParams,
  RecommendationDto,
  RecommendationUsageResponse,
} from './types';

const RECOMMENDATION_TIMEOUT_MS = 90_000;

/**
 * 추천 조회
 */
export const getRecommendation = async (params: RecommendationParams): Promise<RecommendationDto> => {
  const searchParams = new URLSearchParams({weatherId: params.weatherId});
  params.selectedClothesIds?.forEach(id => searchParams.append('selectedClothesIds', id));

  return apiClient.get<RecommendationDto>(`/api/recommendations/ootd?${searchParams.toString()}`, {
    timeout: RECOMMENDATION_TIMEOUT_MS,
  });
};

/** 아웃핏 추천 조회 */
export const getOutfitRecommendation = async (params: RecommendationParams): Promise<RecommendationDto> => {
  const searchParams = new URLSearchParams({weatherId: params.weatherId});
  params.selectedClothesIds?.forEach(id => searchParams.append('selectedClothesIds', id));

  return apiClient.get<RecommendationDto>(`/api/recommendations/outfits?${searchParams.toString()}`, {
    timeout: RECOMMENDATION_TIMEOUT_MS,
  });
};

/** 오늘의 추천 사용량 조회 */
export const getRecommendationUsage = async (): Promise<RecommendationUsageResponse> => {
  return apiClient.get<RecommendationUsageResponse>('/api/recommendations/usage');
};
