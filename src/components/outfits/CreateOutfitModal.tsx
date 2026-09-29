import { type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getClothes } from '@/lib/api/clothes';
import { createOutfit } from '@/lib/api/outfits';
import { getProfileWeather } from '@/lib/api/weather';
import type { ClothesDto, WeatherDto } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { toast } from 'sonner';

const CATEGORIES = ['ALL', '상의', '바지', '스커트', '아우터', '원피스/세트', '모자', '신발', '가방', '악세서리'];

interface CreateOutfitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export default function CreateOutfitModal({ open, onOpenChange, onCreated }: CreateOutfitModalProps) {
  const userId = useAuthStore(state => state.data?.userDto.id);
  const [clothes, setClothes] = useState<ClothesDto[]>([]);
  const [todayWeather, setTodayWeather] = useState<WeatherDto>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const categoryListRef = useRef<HTMLDivElement>(null);
  const categoryDragStartRef = useRef<{ x: number; scrollLeft: number } | null>(null);

  useEffect(() => {
    if (!open || !userId) return;
    setSelectedIds([]);
    setSelectedCategory('ALL');
    setName('');
    setDescription('');
    setLoadingData(true);
    Promise.all([getAllClothes(userId), getProfileWeather(userId)])
      .then(([items, weathers]) => {
        setClothes(items);
        setTodayWeather(weathers.find(weather => isToday(weather.forecastAt)));
      })
      .catch(() => toast.error('옷장 또는 오늘 날씨 정보를 불러오지 못했습니다.'))
      .finally(() => setLoadingData(false));
  }, [open, userId]);

  const selectedClothes = useMemo(() => clothes.filter(item => selectedIds.includes(item.id)), [clothes, selectedIds]);
  const visibleClothes = selectedCategory === 'ALL' ? clothes : clothes.filter(item => matchesCategory(item.type, selectedCategory));

  const toggle = (item: ClothesDto) => {
    if (selectedIds.includes(item.id)) {
      setSelectedIds(ids => ids.filter(id => id !== item.id));
      return;
    }
    if (selectedIds.length >= 10) {
      toast.error('옷은 최대 10개까지 선택할 수 있습니다.');
      return;
    }
    setSelectedIds(ids => [...ids, item.id]);
  };

  const scrollCategories = (direction: number) => categoryListRef.current?.scrollBy({ left: direction * 180, behavior: 'smooth' });
  const startCategoryDrag = (event: PointerEvent<HTMLDivElement>) => {
    categoryDragStartRef.current = { x: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
  };
  const dragCategories = (event: PointerEvent<HTMLDivElement>) => {
    const start = categoryDragStartRef.current;
    if (start) event.currentTarget.scrollLeft = start.scrollLeft - (event.clientX - start.x);
  };
  const endCategoryDrag = () => { categoryDragStartRef.current = null; };

  const submit = async (type: 'OOTD' | 'OUTFIT') => {
    if (!name.trim()) return toast.error('이름을 입력해주세요.');
    if (selectedIds.length === 0) return toast.error('옷을 한 벌 이상 선택해주세요.');
    if (type === 'OOTD' && !todayWeather) return toast.error('오늘 날씨 정보가 없어 OOTD를 등록할 수 없습니다.');
    setLoading(true);
    try {
      await createOutfit({
        name: name.trim(),
        description: description.trim() || undefined,
        category: type,
        clothesIds: selectedIds,
        weatherId: type === 'OOTD' ? todayWeather?.id : undefined,
      });
      toast.success(type === 'OOTD' ? 'OOTD가 등록되었습니다.' : '아웃핏이 등록되었습니다.');
      onOpenChange(false);
      onCreated();
    } catch (error) {
      console.error('직접 아웃핏 등록 실패:', error);
      toast.error('등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(760px,calc(100vh-2rem))] w-[980px] max-w-[calc(100%-2rem)] overflow-hidden rounded-[12px] bg-white p-7 sm:max-w-[calc(100%-2rem)]" showCloseButton={false}>
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-5">
          <div className="flex items-start">
            <div><h2 className="text-[23px] font-extrabold text-[#212126]">OOTD/OUTFIT 만들기</h2><p className="mt-1 text-[14px] text-[#808089]">내 옷장에서 직접 조합해 저장하세요.</p></div>
          </div>
          <div className="grid min-h-0 overflow-hidden grid-cols-[minmax(0,1fr)_280px] gap-6">
            <section className="flex h-full min-h-0 flex-col">
              <div className="mb-3 flex items-center gap-2">
                <button type="button" aria-label="이전 카테고리" onClick={() => scrollCategories(-1)} className="shrink-0 px-1 text-xl leading-none text-[#3d5570]">‹</button>
                <div ref={categoryListRef} onPointerDown={startCategoryDrag} onPointerMove={dragCategories} onPointerUp={endCategoryDrag} onPointerCancel={endCategoryDrag} onPointerLeave={endCategoryDrag} className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-y select-none">{CATEGORIES.map(category => <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`shrink-0 rounded-full px-3 py-2 text-[13px] font-bold ${selectedCategory === 'ALL' && category === 'ALL' || selectedCategory === category ? 'bg-[#3d5570] text-white' : 'bg-[#f2ede5] text-[#2a2d31]'}`}>{category === 'ALL' ? '전체' : category}</button>)}</div>
                <button type="button" aria-label="다음 카테고리" onClick={() => scrollCategories(1)} className="shrink-0 px-1 text-xl leading-none text-[#3d5570]">›</button>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-3 gap-3 overflow-y-auto pb-3 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {loadingData ? <p className="col-span-3 py-12 text-center text-[#808089]">옷장을 불러오는 중...</p> : visibleClothes.map(item => {
                  const selected = selectedIds.includes(item.id);
                  return <button key={item.id} type="button" onClick={() => toggle(item)} className={`min-h-[190px] overflow-hidden rounded-[8px] border text-left ${selected ? 'border-[#3d5570] ring-2 ring-[#3d5570]' : 'border-[#ded6cb]'}`}><div className="h-36 bg-[#f2ede5] sm:h-40">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="size-full object-cover" /> : null}</div><p className="line-clamp-2 break-words p-2 text-[12px] font-bold leading-4">{item.name}</p></button>;
                })}
              </div>
            </section>
            <aside className="flex h-full min-h-0 flex-col gap-3 overflow-hidden rounded-2xl bg-[#f7f7f8] p-4">
              <p className="shrink-0 font-bold text-[#212126]">선택한 옷 {selectedClothes.length}개</p>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">{selectedClothes.map(item => <div key={item.id} className="flex items-center gap-2 rounded-lg bg-white p-2"><div className="size-10 overflow-hidden rounded bg-[#f2ede5]">{item.imageUrl && <img src={item.imageUrl} alt="" className="size-full object-cover" />}</div><span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.name}</span><button type="button" onClick={() => toggle(item)} className="text-xs text-[#3d5570]">해제</button></div>)}</div>
              <div className="shrink-0 space-y-3">
                <input value={name} onChange={event => setName(event.target.value)} placeholder="이름 입력" maxLength={100} className="h-10 w-full rounded-lg border border-[#ded6cb] bg-white px-3 text-sm outline-none focus:border-[#3d5570]" />
                <textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="설명 (선택)" className="h-20 w-full resize-none rounded-lg border border-[#ded6cb] bg-white p-3 text-sm outline-none focus:border-[#3d5570]" />
                <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => submit('OOTD')} disabled={loading || loadingData} className="h-11 rounded-lg border border-[#3d5570] text-[13px] font-bold text-[#3d5570] disabled:opacity-50">OOTD 등록하기</button>
                <button type="button" onClick={() => submit('OUTFIT')} disabled={loading || loadingData} className="h-11 rounded-lg bg-[#3d5570] text-[13px] font-bold text-white disabled:opacity-50">OUTFIT 등록하기</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function getAllClothes(ownerId: string) {
  const items: ClothesDto[] = [];
  let cursor: string | undefined;
  let idAfter: string | undefined;
  let hasNext = true;
  while (hasNext) { const response = await getClothes({ ownerId, limit: 100, cursor, idAfter }); items.push(...response.data); cursor = response.nextCursor; idAfter = response.nextIdAfter; hasNext = response.hasNext; }
  return items;
}

function isToday(value: string) { const date = new Date(value); const today = new Date(); return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate(); }
function matchesCategory(type: string, category: string) { const aliases: Record<string, string[]> = { '상의': ['상의', 'TOP'], '바지': ['바지', 'PANTS', 'BOTTOM'], '스커트': ['스커트', 'SKIRT'], '아우터': ['아우터', 'OUTER'], '원피스/세트': ['원피스/세트', 'DRESS'], '모자': ['모자', 'HAT'], '신발': ['신발', 'SHOES'], '가방': ['가방', 'BAG'], '악세서리': ['악세서리', 'ACCESSORY'] }; return aliases[category]?.includes(type) ?? false; }
