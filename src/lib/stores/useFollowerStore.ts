import {create} from 'zustand';
import {type UserSummary, type FollowerListParam} from '@/lib/api/types';
import {getFollowers} from '@/lib/api/follows';
import {type PaginatedStore} from './types';
import {createPaginatedStoreActions} from "@/lib/stores/actions.ts";

type FollowerStore = PaginatedStore<UserSummary, FollowerListParam>;

export const useFollowerStore = create<FollowerStore>((set, get) => ({
  ...createPaginatedStoreActions({
    set,
    get,
    fetchApi: getFollowers,
    keyExtractor: user => user.userId
  })
}));