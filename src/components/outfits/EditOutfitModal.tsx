import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { getClothes } from '@/lib/api/clothes';
import { updateOutfit } from '@/lib/api/outfits';
import type { ClothesDto, OutfitClothesDto, OutfitDto } from '@/lib/api/types';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import OutfitImage from './OutfitImage';

interface EditOutfitModalProps {
  outfit: OutfitDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (outfit: OutfitDto) => void;
}

function asOutfitClothes(clothes: ClothesDto): OutfitClothesDto {
  return { id: clothes.id, name: clothes.name, imageUrl: clothes.imageUrl };
}

export default function EditOutfitModal({ outfit, open, onOpenChange, onSaved }: EditOutfitModalProps) {
  const userId = useAuthStore((state) => state.data?.userDto.id);
  const [name, setName] = useState(outfit.name);
  const [description, setDescription] = useState(outfit.description);
  const [category, setCategory] = useState(outfit.category);
  const [selectedClothesIds, setSelectedClothesIds] = useState<string[]>(outfit.clothes.map((item) => item.id));
  const [wardrobe, setWardrobe] = useState<OutfitClothesDto[]>(outfit.clothes);
  const [loadingWardrobe, setLoadingWardrobe] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setName(outfit.name);
    setDescription(outfit.description);
    setCategory(outfit.category);
    setSelectedClothesIds(outfit.clothes.map((item) => item.id));
    setWardrobe(outfit.clothes);

    if (!userId) return;

    const controller = new AbortController();
    const loadWardrobe = async () => {
      setLoadingWardrobe(true);
      const clothesById = new Map(outfit.clothes.map((item) => [item.id, item]));
      let cursor: string | undefined;
      let idAfter: string | undefined;

      try {
        do {
          const page = await getClothes({ ownerId: userId, limit: 100, cursor, idAfter });
          page.data.forEach((item) => clothesById.set(item.id, asOutfitClothes(item)));
          cursor = page.nextCursor;
          idAfter = page.nextIdAfter;
          if (!page.hasNext || (!cursor && !idAfter)) break;
        } while (!controller.signal.aborted);

        if (!controller.signal.aborted) setWardrobe([...clothesById.values()]);
      } catch {
        if (!controller.signal.aborted) {
          toast.error('옷장 목록을 불러오지 못했어요. 현재 아웃핏의 의류만 수정할 수 있습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setLoadingWardrobe(false);
      }
    };

    void loadWardrobe();
    return () => controller.abort();
  }, [open, outfit, userId]);

  const selectedClothes = useMemo(() => {
    const clothesById = new Map(wardrobe.map((item) => [item.id, item]));
    return selectedClothesIds.map((id) => clothesById.get(id)).filter((item): item is OutfitClothesDto => Boolean(item));
  }, [selectedClothesIds, wardrobe]);

  const toggleClothes = (clothesId: string) => {
    setSelectedClothesIds((ids) => ids.includes(clothesId)
      ? ids.filter((id) => id !== clothesId)
      : [...ids, clothesId]);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();

    if (!trimmedName || !trimmedCategory) {
      toast.error('이름과 카테고리를 입력해주세요.');
      return;
    }
    if (selectedClothesIds.length === 0) {
      toast.error('아웃핏에 포함할 의류를 한 개 이상 선택해주세요.');
      return;
    }

    setSaving(true);
    try {
      const response = await updateOutfit(outfit.id, {
        name: trimmedName,
        description,
        category: trimmedCategory,
        clothesIds: selectedClothesIds,
      });
      const selectedClothesById = new Map(selectedClothes.map((item) => [item.id, item]));
      const clothes = response.clothes.length > 0
        ? response.clothes.map((item) => ({
          ...item,
          imageUrl: selectedClothesById.get(item.id)?.imageUrl ?? item.imageUrl,
        }))
        : selectedClothes;
      onSaved({
        ...outfit,
        name: response.name,
        description: response.description,
        category: trimmedCategory,
        clothes,
      });
      toast.success('아웃핏이 수정되었습니다.');
      onOpenChange(false);
    } catch {
      toast.error('아웃핏 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto p-6 sm:max-w-[680px]" showCloseButton={!saving}>
        <DialogTitle className="text-[22px] font-bold tracking-[-0.55px]">아웃핏 수정</DialogTitle>
        <DialogDescription>이름, 설명, 카테고리와 포함할 의류를 변경할 수 있습니다.</DialogDescription>
        <form onSubmit={handleSave} className="mt-2 space-y-5">
          <label className="block space-y-2 text-sm font-bold text-gray-600">
            이름
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
              disabled={saving}
              className="h-[46px] w-full rounded-xl border border-gray-200 px-4 text-base font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </label>
          <label className="block space-y-2 text-sm font-bold text-gray-600">
            설명
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={saving}
              rows={3}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-base font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </label>
          <label className="block space-y-2 text-sm font-bold text-gray-600">
            카테고리
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              maxLength={100}
              required
              disabled={saving}
              className="h-[46px] w-full rounded-xl border border-gray-200 px-4 text-base font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />
          </label>
          <fieldset disabled={saving} className="space-y-2">
            <legend className="text-sm font-bold text-gray-600">구성 의류 ({selectedClothesIds.length})</legend>
            {loadingWardrobe ? (
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                <LoaderCircle className="size-4 animate-spin" /> 옷장을 불러오는 중입니다.
              </div>
            ) : (
              <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-gray-200 p-2 sm:grid-cols-3">
                {wardrobe.map((item) => {
                  const checked = selectedClothesIds.includes(item.id);
                  return (
                    <label key={item.id} className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleClothes(item.id)} className="size-4 accent-blue-500" />
                      <span className="size-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <OutfitImage imageUrl={item.imageUrl} alt="" />
                      </span>
                      <span className="line-clamp-2 min-w-0 text-sm font-semibold text-gray-700">{item.name || '이름 없는 의류'}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>취소</Button>
            <Button type="submit" disabled={saving || loadingWardrobe}>{saving ? '저장 중...' : '저장'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
