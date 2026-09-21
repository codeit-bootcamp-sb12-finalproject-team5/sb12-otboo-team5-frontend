import {apiClient} from './client';
import type {OutfitCreateRequest, OutfitCreateResponse} from './types';

export const createOutfit = async (request: OutfitCreateRequest): Promise<OutfitCreateResponse> => {
  return apiClient.post<OutfitCreateResponse>('/api/outfit', request);
};
