import {create} from 'zustand';
import type {RecommendationDto, RecommendationParams} from '@/lib/api/types';
import {getRecommendation} from '@/lib/api/recommendations';
import type {BaseStore} from './types';
import {createBaseStoreActions} from "@/lib/stores/actions.ts";

interface RecommendationStore extends BaseStore<RecommendationDto, RecommendationParams> {
  setWeatherId: (weatherId: string) => void;
}

export const useRecommendationStore = create<RecommendationStore>((set, get) => ({
  ...createBaseStoreActions({
    set, get,
    fetchApi: getRecommendation
  }),
  setWeatherId: (weatherId) => set({
    params: { weatherId },
    data: null,
    error: undefined,
  }),
}));
