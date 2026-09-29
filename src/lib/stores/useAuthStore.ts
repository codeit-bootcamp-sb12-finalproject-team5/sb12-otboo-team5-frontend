import { create } from 'zustand';
import type { JwtDto } from '@/lib/api/types';
import {getCsrfToken, refreshToken, signIn, signOut} from '@/lib/api/auth';
import type { BaseStore } from './types';
import {execute} from "@/lib/stores/utils";
import {createBaseStoreActions} from "@/lib/stores/actions.ts";
import {clearRecommendationSessions} from '@/lib/recommendationSession';

interface AuthStore extends BaseStore<JwtDto, unknown> {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: () => boolean;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...createBaseStoreActions({
    set, get,
    fetchApi: refreshToken,
  }),
  signIn: async (email: string, password: string) => {
    await execute(
        set, get,
        () => signIn({ email, password }),
        {
          shouldThrow: true
        }
    )
  },

  signOut: async () => {
    await execute(
        set, get,
        signOut,
        {
          onSuccess: (_result, _set, get) => {
            clearRecommendationSessions();
            get().clear();
            getCsrfToken();
          },
        }
    )
  },

  isAuthenticated: () => {
    const { data } = get();
    return data?.accessToken != null;
  },

  getAccessToken: () => {
    const { data } = get();
    return data?.accessToken || null;
  },
}));
