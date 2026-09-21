import { apiClient } from './client';
import type {
  RecommendationParams,
  RecommendationDto,
  RecommendationUsageResponse,
} from './types';

/**
 * 추천 조회
 */
export const getRecommendation = async (params: RecommendationParams): Promise<RecommendationDto> => {
  return apiClient.get<RecommendationDto>('/api/recommendations/ootd', { params });
};

/** 오늘의 추천 사용량 조회 */
export const getRecommendationUsage = async (): Promise<RecommendationUsageResponse> => {
  return apiClient.get<RecommendationUsageResponse>('/api/recommendations/usage');
};
