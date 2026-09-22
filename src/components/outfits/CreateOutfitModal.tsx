import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getClothes } from '@/lib/api/clothes';
import { createFeed } from '@/lib/api/feeds';
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

  const submit = async (type: 'OOTD' | 'outfit') => {
    if (!name.trim()) return toast.error('이름을 입력해주세요.');
    if (selectedIds.length === 0) return toast.error('옷을 한 벌 이상 선택해주세요.');
    if (type === 'OOTD' && !todayWeather) return toast.error('오늘 날씨 정보가 없어 OOTD를 등록할 수 없습니다.');
    setLoading(true);
    try {
      const createdOutfit = await createOutfit({
        name: name.trim(),
        description: description.trim() || undefined,
        category: type,
        clothesIds: selectedIds,
        weatherId: todayWeather?.id,
      });
      if (type === 'OOTD') {
        if (!userId) throw new Error('로그인 정보가 없습니다.');
        await createFeed({
          authorId: userId,
          outfitId: createdOutfit.id,
          content: description.trim() || name.trim(),
        });
      }
      toast.success(type === 'OOTD' ? 'OOTD 피드가 등록되었습니다.' : '아웃핏이 등록되었습니다.');
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
      <DialogContent className="h-[min(760px,calc(100vh-2rem))] w-[980px] max-w-[calc(100%-2rem)] overflow-hidden rounded-[28px] bg-white p-7 sm:max-w-[calc(100%-2rem)]" showCloseButton={false}>
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-5">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="text-[23px] font-extrabold text-[#212126]">OOTD/outfit 만들기</h2><p className="mt-1 text-[14px] text-[#808089]">내 옷장에서 직접 조합해 저장하세요.</p></div>
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg px-3 py-2 font-semibold text-[#696975] hover:bg-[#f7f7f8]">닫기</button>
          </div>
          <div className="grid min-h-0 overflow-hidden grid-cols-[minmax(0,1fr)_280px] gap-6">
            <section className="flex h-full min-h-0 flex-col">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">{CATEGORIES.map(category => <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`shrink-0 rounded-full px-3 py-2 text-[13px] font-bold ${selectedCategory === category ? 'bg-[#1e89f4] text-white' : 'bg-[#f7f7f8] text-[#696975]'}`}>{category === 'ALL' ? '전체' : category}</button>)}</div>
              <div className="grid min-h-0 flex-1 grid-cols-3 gap-3 overflow-y-auto pb-3 pr-2">
                {loadingData ? <p className="col-span-3 py-12 text-center text-[#808089]">옷장을 불러오는 중...</p> : visibleClothes.map(item => {
                  const selected = selectedIds.includes(item.id);
                  return <button key={item.id} type="button" onClick={() => toggle(item)} className={`min-h-[184px] overflow-hidden rounded-xl border text-left ${selected ? 'border-[#1e89f4] ring-2 ring-[#1e89f4]' : 'border-[#e7e7e9]'}`}><div className="h-36 bg-[#f1f1f3] sm:h-40">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="size-full object-cover" /> : null}</div><p className="truncate p-2 text-[13px] font-bold">{item.name}</p></button>;
                })}
              </div>
            </section>
            <aside className="flex h-full min-h-0 flex-col gap-3 overflow-hidden rounded-2xl bg-[#f7f7f8] p-4">
              <p className="shrink-0 font-bold text-[#212126]">선택한 옷 {selectedClothes.length}개</p>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">{selectedClothes.map(item => <div key={item.id} className="flex items-center gap-2 rounded-lg bg-white p-2"><div className="size-10 overflow-hidden rounded bg-[#e7e7e9]">{item.imageUrl && <img src={item.imageUrl} alt="" className="size-full object-cover" />}</div><span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.name}</span><button type="button" onClick={() => toggle(item)} className="text-xs text-[#1e89f4]">해제</button></div>)}</div>
              <div className="shrink-0 space-y-3">
                <input value={name} onChange={event => setName(event.target.value)} placeholder="이름 입력" maxLength={100} className="h-10 w-full rounded-lg border border-[#d4d4d9] bg-white px-3 text-sm outline-none focus:border-[#1e89f4]" />
                <textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="설명 (선택)" className="h-20 w-full resize-none rounded-lg border border-[#d4d4d9] bg-white p-3 text-sm outline-none focus:border-[#1e89f4]" />
                <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => submit('OOTD')} disabled={loading || loadingData} className="h-11 rounded-lg border border-[#1e89f4] bg-white font-bold text-[#1e89f4] disabled:opacity-50">OOTD 등록하기</button>
                <button type="button" onClick={() => submit('outfit')} disabled={loading || loadingData} className="h-11 rounded-lg bg-[#1e89f4] font-bold text-white disabled:opacity-50">outfit 등록하기</button>
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
