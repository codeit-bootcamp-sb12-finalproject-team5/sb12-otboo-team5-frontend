import type { RecommendationDto } from '@/lib/api/types';

const SESSION_KEY_PREFIX = 'recommendation';

type RecommendationType = 'ootd' | 'outfit';

function getKey(type: RecommendationType, userId: string, weatherId: string) {
  return `${SESSION_KEY_PREFIX}:${type}:${userId}:${weatherId}`;
}

export function loadRecommendationSession(
  type: RecommendationType,
  userId: string,
  weatherId: string,
): RecommendationDto | undefined {
  try {
    const value = sessionStorage.getItem(getKey(type, userId, weatherId));
    return value ? JSON.parse(value) as RecommendationDto : undefined;
  } catch {
    return undefined;
  }
}

export function saveRecommendationSession(
  type: RecommendationType,
  userId: string,
  weatherId: string,
  recommendation: RecommendationDto,
) {
  try {
    sessionStorage.setItem(getKey(type, userId, weatherId), JSON.stringify(recommendation));
  } catch (error) {
    console.warn('추천 결과를 세션에 저장하지 못했습니다.', error);
  }
}

export function clearRecommendationSessions() {
  try {
    Object.keys(sessionStorage)
      .filter(key => key.startsWith(`${SESSION_KEY_PREFIX}:`))
      .forEach(key => sessionStorage.removeItem(key));
  } catch (error) {
    console.warn('추천 세션을 삭제하지 못했습니다.', error);
  }
}
