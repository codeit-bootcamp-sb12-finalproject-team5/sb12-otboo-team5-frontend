import {create} from 'zustand';
import {type UserSummary, type FollowingListParam} from '@/lib/api/types';
import {getFollowings} from '@/lib/api/follows';
import {type PaginatedStore} from './types';
import {createPaginatedStoreActions} from "@/lib/stores/actions.ts";

type FollowingStore = PaginatedStore<UserSummary, FollowingListParam>;

export const useFollowingStore = create<FollowingStore>((set, get) => ({
  ...createPaginatedStoreActions({
    set,
    get,
    fetchApi: getFollowings,
    keyExtractor: user => user.userId
  })
}));