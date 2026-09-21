import { apiClient } from './client';
import type { OutfitDto, OutfitListParams, OutfitListResponse, OutfitUpdateRequest, OutfitUpdateResponse } from './types';

export const getOutfitList = (
  params?: OutfitListParams,
  signal?: AbortSignal,
): Promise<OutfitListResponse> => {
  return apiClient.get<OutfitListResponse>('/api/outfit', { params, signal });
};

export const getOutfit = (outfitId: string, signal?: AbortSignal): Promise<OutfitDto> => {
  return apiClient.get<OutfitDto>(`/api/outfit/${encodeURIComponent(outfitId)}`, { signal });
};

export const updateOutfit = (outfitId: string, request: OutfitUpdateRequest): Promise<OutfitUpdateResponse> => {
  return apiClient.patch<OutfitUpdateResponse>(`/api/outfit/${encodeURIComponent(outfitId)}`, request);
};

export const deleteOutfit = async (outfitId: string): Promise<void> => {
  await apiClient.delete<void>(`/api/outfit/${encodeURIComponent(outfitId)}`);
};
