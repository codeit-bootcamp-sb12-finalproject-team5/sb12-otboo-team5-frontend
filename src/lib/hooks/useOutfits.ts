import { useCallback, useEffect, useState } from 'react';
import { getOutfitList } from '@/lib/api/outfits';
import type { OutfitDto, OutfitListParams } from '@/lib/api/types';
import { useAuthStore } from '@/lib/stores/useAuthStore';

interface OutfitListState {
  userId?: string;
  outfits: OutfitDto[];
  loading: boolean;
  error: string | null;
}

export function useOutfits() {
  const userId = useAuthStore((state) => state.data?.userDto.id);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<OutfitListState>({
    outfits: [],
    loading: Boolean(userId),
    error: null,
  });
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const updateOutfit = useCallback((outfit: OutfitDto) => {
    setState((current) => ({
      ...current,
      outfits: current.outfits.map((item) => item.id === outfit.id ? outfit : item),
    }));
  }, []);
  const removeOutfit = useCallback((outfitId: string) => {
    setState((current) => ({
      ...current,
      outfits: current.outfits.filter((item) => item.id !== outfitId),
    }));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ userId, outfits: [], loading: Boolean(userId), error: null });

    if (!userId) return () => controller.abort();

    async function loadOutfits() {
      const outfitsById = new Map<string, OutfitDto>();
      const visitedCursors = new Set<string>();
      let params: OutfitListParams | undefined;

      try {
        while (!controller.signal.aborted) {
          const page = await getOutfitList(params, controller.signal);
          if (controller.signal.aborted) return;

          const previousCount = outfitsById.size;
          page.data.forEach((outfit) => outfitsById.set(outfit.id, outfit));
          setState({ userId, outfits: [...outfitsById.values()], loading: page.hasNext, error: null });
          if (!page.hasNext) return;

          const cursor = page.nextCursor || undefined;
          if (
            !cursor ||
            visitedCursors.has(cursor) ||
            outfitsById.size === previousCount
          ) {
            throw new Error('다음 아웃핏 목록을 불러오지 못했어요. 다시 시도해 주세요.');
          }

          visitedCursors.add(cursor);
          params = { cursor };
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          userId,
          outfits: [...outfitsById.values()],
          loading: false,
          error: error instanceof Error ? error.message : '아웃핏 목록을 불러오지 못했어요.',
        });
      }
    }

    void loadOutfits();
    return () => controller.abort();
  }, [userId, revision]);

  // Hide the previous account's results immediately, before effect cleanup runs.
  if (state.userId !== userId) {
    return { outfits: [], loading: Boolean(userId), error: null, reload, updateOutfit, removeOutfit };
  }

  return { outfits: state.outfits, loading: state.loading, error: state.error, reload, updateOutfit, removeOutfit };
}
