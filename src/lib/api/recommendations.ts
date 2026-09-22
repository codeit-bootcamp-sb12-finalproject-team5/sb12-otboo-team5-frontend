import { apiClient } from './client';
import type {
  RecommendationParams,
  RecommendationDto,
  RecommendationPreferenceRequest,
} from './types';

/**
 * 추천 조회
 */
export const getRecommendation = async (params: RecommendationParams): Promise<RecommendationDto> => {
  return apiClient.get<RecommendationDto>('/api/recommendations', { params });
};

export const updateRecommendationPreferences = async (
  request: RecommendationPreferenceRequest,
): Promise<void> => {
  await apiClient.post<void>('/api/recommendations/preferences', request);
};
