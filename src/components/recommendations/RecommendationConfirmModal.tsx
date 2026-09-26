import {Dialog, DialogContent} from '@/components/ui/dialog';
import type {ClothesDto, RecommendationUsage} from '@/lib/api';
import {useEffect, useRef, useState} from 'react';

const CLOSET_CATEGORIES = ['ALL', '상의', '바지', '스커트', '아우터', '원피스/세트', '모자', '신발', '가방', '악세서리'];

interface RecommendationConfirmModalProps {
  open: boolean;
  title?: string;
  showDateQuestion?: boolean;
  finalRecommendationLabel?: string;
  dateLabel: string;
  usage?: RecommendationUsage;
  clothes: ClothesDto[];
  selectedClothesIds: string[];
  loadingUsage: boolean;
  loadingClothes: boolean;
  recommending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onToggleClothes: (clothesIds: string[]) => void;
}

export default function RecommendationConfirmModal({
  open,
  title = 'OOTD 추천 받기',
  showDateQuestion = true,
  finalRecommendationLabel,
  dateLabel,
  usage,
  clothes,
  selectedClothesIds,
  loadingUsage,
  loadingClothes,
  recommending,
  onClose,
  onConfirm,
  onToggleClothes,
}: RecommendationConfirmModalProps) {
  const [isClothesPickerOpen, setIsClothesPickerOpen] = useState(false);
  const [isFinalConfirmationOpen, setIsFinalConfirmationOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const categoryListRef = useRef<HTMLDivElement>(null);
  const categoryScrollTimerRef = useRef<number | null>(null);
  const categoryDragRef = useRef({active: false, startX: 0, scrollLeft: 0});
  const unavailable = !usage || usage.remaining <= 0;
  const visibleClothes = selectedCategory === 'ALL'
    ? clothes
    : clothes.filter(clothes => belongsToCategory(clothes.type, selectedCategory));
  const selectedClothes = clothes.filter(clothes => selectedClothesIds.includes(clothes.id));
  const modalWidth = isClothesPickerOpen
    ? 1000
    : isFinalConfirmationOpen && selectedClothes.length > 0
      ? Math.min(1000, Math.max(580, selectedClothes.length * 195 + 60))
      : 520;

  useEffect(() => {
    if (open) {
      setIsClothesPickerOpen(false);
      setIsFinalConfirmationOpen(false);
      setSelectedCategory('ALL');
    }
  }, [open]);

  const toggleClothes = (clothesId: string) => {
    onToggleClothes(
      selectedClothesIds.includes(clothesId)
        ? selectedClothesIds.filter(id => id !== clothesId)
        : [...selectedClothesIds, clothesId]
    );
  };

  const openFinalConfirmation = () => {
    setIsClothesPickerOpen(false);
    setIsFinalConfirmationOpen(true);
  };

  const stopCategoryScroll = () => {
    if (categoryScrollTimerRef.current !== null) {
      window.clearInterval(categoryScrollTimerRef.current);
      categoryScrollTimerRef.current = null;
    }
  };

  const startCategoryScroll = (direction: -1 | 1) => {
    stopCategoryScroll();
    categoryListRef.current?.scrollBy({left: direction * 120, behavior: 'smooth'});
    categoryScrollTimerRef.current = window.setInterval(() => {
      categoryListRef.current?.scrollBy({left: direction * 22, behavior: 'auto'});
    }, 35);
  };

  const startCategoryDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = categoryListRef.current;
    if (!container) return;
    categoryDragRef.current = {active: true, startX: event.pageX, scrollLeft: container.scrollLeft};
  };

  const moveCategoryDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = categoryListRef.current;
    if (!container || !categoryDragRef.current.active) return;
    container.scrollLeft = categoryDragRef.current.scrollLeft - (event.pageX - categoryDragRef.current.startX);
  };

  const stopCategoryDrag = () => {
    categoryDragRef.current.active = false;
  };

  useEffect(() => () => stopCategoryScroll(), []);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="box-border flex max-h-[calc(100vh-2rem)] flex-col gap-6 overflow-y-auto rounded-[18px] border border-[#e5ddd2] bg-[#fdfdfa] p-8 shadow-[0_22px_60px_rgba(15,42,68,0.26)] max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-2rem)] transition-all"
        style={{width: `${modalWidth}px`}}
        showCloseButton={false}
      >
        <div className="flex items-start">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-[30px] font-semibold tracking-[-0.05em] text-[#0f2a44]">
              {title}
            </h2>
            {showDateQuestion && (
              <p className="font-semibold text-[#7a8ca3] text-[16px] tracking-[-0.4px]">
                {dateLabel} OOTD 추천을 시작할까요?
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0">
          {loadingUsage ? (
            <div className="col-span-2 rounded-[10px] bg-[#f7f3ed] px-5 py-5 text-center font-semibold text-[#7a8ca3]">추천 가능 횟수를 확인하고 있습니다.</div>
          ) : usage ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#f2ede5] text-[22px] text-[#3d5570]">♧</span>
                <div><p className="text-[13px] font-semibold text-[#7a8ca3]">오늘 추천 가능 횟수</p><p className="mt-0.5 text-[23px] font-bold leading-none text-[#0f2a44]">{usage.limit}회</p></div>
              </div>
              <div className="flex items-center gap-3 border-l border-[#ded6cb] px-4 py-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#f2ede5] text-[22px] text-[#3d5570]">◷</span>
                <div><p className="text-[13px] font-semibold text-[#7a8ca3]">오늘 남은 추천 횟수</p><p className="mt-0.5 text-[23px] font-bold leading-none text-[#0f2a44]">{usage.remaining}회</p></div>
              </div>
            </>
          ) : (
            <div className="col-span-2 rounded-[10px] bg-[#f7f3ed] px-5 py-5 text-center font-semibold text-[#7a8ca3]">추천 가능 횟수를 불러오지 못했습니다.</div>
          )}
        </div>

        {isFinalConfirmationOpen ? (
          <section className="flex flex-col gap-4 rounded-[16px] bg-[#f7f7f8] p-5">
            <h3 className="font-bold text-[#212126] text-[18px]">추천을 시작할까요?</h3>
            {selectedClothes.length === 0 ? (
              <p className="font-semibold leading-6 text-[#575765] text-[16px]">
                {finalRecommendationLabel
                  ? `고정한 옷 없이 ${finalRecommendationLabel} 추천을 받을까요?`
                  : `고정한 옷 없이 ${dateLabel} 날씨에 맞는 코디를 추천받을까요?`}
              </p>
            ) : (
              <>
                <p className="font-semibold leading-6 text-[#575765] text-[16px]">
                  {finalRecommendationLabel
                    ? `선택한 옷 ${selectedClothes.length}개를 기반으로 ${finalRecommendationLabel} 추천을 받을까요?`
                    : `선택한 옷 ${selectedClothes.length}개를 기반으로 ${dateLabel} 코디를 추천받을까요?`}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedClothes.map((clothes) => (
                    <div key={clothes.id} className="flex h-[230px] w-[180px] shrink-0 flex-col overflow-hidden rounded-[14px] bg-white shadow-[0px_2px_4px_rgba(55,55,64,0.08)]">
                      <div className="h-[166px] w-full shrink-0 bg-[#e7e7e9]">
                        {clothes.imageUrl ? (
                          <img src={clothes.imageUrl} alt={clothes.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#a9a9b1] text-[12px]">이미지 없음</div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
                        <p className="truncate font-bold text-[#33333a] text-[15px]">{clothes.name}</p>
                        <p className="font-semibold text-[#808089] text-[13px]">{clothes.type}</p>
                        <span className="w-fit rounded-full bg-[#e8f3ff] px-2 py-0.5 font-bold text-[#1e89f4] text-[11px]">고정</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <p className="text-[#808089] text-[14px]">추천을 받으면 오늘의 추천 횟수가 1회 차감됩니다.</p>
          </section>
        ) : (
        <section className="flex flex-col gap-4 border-t border-[#e5ddd2] pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#0f2a44] text-[18px]">고정할 옷 선택</h3>
              <p className="mt-1 text-[#7a8ca3] text-[14px]">선택한 옷은 추천 코디에 반드시 포함돼요.</p>
            </div>
            <span className="rounded-full bg-[#e8f1fa] px-3 py-1 font-semibold text-[#3d5570] text-[13px]">
              {selectedClothesIds.length}개 선택
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-[10px] border border-[#ded6cb] bg-white px-3 py-3">
            <button
              type="button"
              onClick={() => setIsClothesPickerOpen(true)}
              disabled={loadingClothes || clothes.length === 0}
              className="h-[42px] rounded-[10px] bg-[#0f2a44] px-4 font-bold text-white text-[15px] hover:bg-[#3d5570] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingClothes ? '옷장 불러오는 중...' : '옷 선택하기'}
            </button>
            <button
              type="button"
              onClick={() => onToggleClothes([])}
              className="h-[42px] rounded-[10px] px-3 font-semibold text-[#7a8ca3] text-[14px] hover:bg-[#f7f3ed]"
            >
              선택 초기화
            </button>
            {selectedClothes.length > 0 && !isClothesPickerOpen && (
              <p className="min-w-0 truncate text-[#696975] text-[14px]">
                {selectedClothes.map(clothes => clothes.name).join(', ')}
              </p>
            )}
          </div>

          {!loadingClothes && clothes.length === 0 && (
            <p className="rounded-[10px] bg-[#f7f3ed] py-3 text-center font-semibold text-[#7a8ca3] text-[14px]">
              등록된 옷이 없습니다. 고정 옷 없이 추천받을 수 있어요.
            </p>
          )}

          {isClothesPickerOpen && (
            <div className="grid h-[420px] min-h-0 grid-cols-[minmax(0,1fr)_320px] gap-6 border-t border-[#e7e7e9] pt-5">
              <div className="min-w-0">
                <div className="mb-4 flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="이전 카테고리"
                    onMouseDown={() => startCategoryScroll(-1)}
                    onMouseUp={stopCategoryScroll}
                    onMouseLeave={stopCategoryScroll}
                    onTouchStart={() => startCategoryScroll(-1)}
                    onTouchEnd={stopCategoryScroll}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-[#3d5570] hover:bg-[#f2ede5]"
                  >
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14 6-6 6 6 6" /></svg>
                  </button>
                  <div
                    ref={categoryListRef}
                    onMouseDown={startCategoryDrag}
                    onMouseMove={moveCategoryDrag}
                    onMouseUp={stopCategoryDrag}
                    onMouseLeave={stopCategoryDrag}
                    className="flex flex-1 cursor-grab gap-2 overflow-x-auto select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
                  >
                    {CLOSET_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`shrink-0 rounded-full px-4 py-2 font-semibold text-[14px] ${
                          selectedCategory === category
                            ? 'bg-[#3d5570] text-white'
                            : 'bg-[#f7f3ed] text-[#60738d] hover:bg-[#f2ede5]'
                        }`}
                      >
                        {categoryLabel(category)}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="다음 카테고리"
                    onMouseDown={() => startCategoryScroll(1)}
                    onMouseUp={stopCategoryScroll}
                    onMouseLeave={stopCategoryScroll}
                    onTouchStart={() => startCategoryScroll(1)}
                    onTouchEnd={stopCategoryScroll}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-[#3d5570] hover:bg-[#f2ede5]"
                  >
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10 6 6 6-6 6" /></svg>
                  </button>
                </div>
                <div className="clothes-scrollbar grid max-h-[360px] grid-cols-3 gap-3 overflow-y-auto pr-2 [scrollbar-color:#7a8ca3_#fdfdfa] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#fdfdfa] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7a8ca3] [&::-webkit-scrollbar-thumb:hover]:bg-[#3d5570]">
                  {visibleClothes.map((clothes) => {
                    const selected = selectedClothesIds.includes(clothes.id);
                    const blockedReason = selected ? undefined : getSelectionBlockedReason(clothes, selectedClothes);

                    return (
                      <button
                        key={clothes.id}
                        type="button"
                        onClick={() => toggleClothes(clothes.id)}
                        disabled={Boolean(blockedReason)}
                        title={blockedReason}
                        className={`relative overflow-hidden rounded-[8px] border text-left transition-all disabled:cursor-not-allowed ${
                          selected
                            ? 'border-[#3d5570] ring-2 ring-[#3d5570]'
                            : blockedReason
                              ? 'border-[#e7e7e9] opacity-35 grayscale'
                              : 'border-[#e5ddd2] hover:border-[#7a8ca3]'
                        }`}
                      >
                        <div className="aspect-square bg-[#f1f1f3]">
                          {clothes.imageUrl ? (
                            <img src={clothes.imageUrl} alt={clothes.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[#a9a9b1] text-[12px]">이미지 없음</div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="truncate font-bold text-[#33333a] text-[13px]">{clothes.name}</p>
                        </div>
                        {selected && (
                          <span className="absolute right-2 top-2 rounded-full bg-[#3d5570] px-2 py-1 font-bold text-[11px] text-white">고정</span>
                        )}
                        {blockedReason && (
                          <span className="absolute inset-x-1 bottom-1 rounded bg-[#575765]/90 px-1 py-0.5 text-center text-[10px] text-white">
                            선택 불가
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <aside className="flex min-h-0 flex-col rounded-[16px] bg-[#f7f7f8] p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#212126] text-[16px]">선택한 옷</h4>
                  <span className="font-semibold text-[#3d5570] text-[14px]">{selectedClothes.length}개</span>
                </div>
                {selectedClothes.length > 0 ? (
                  <div className="clothes-scrollbar mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto [scrollbar-color:#7a8ca3_#f7f7f8] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#f7f7f8] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#7a8ca3] [&::-webkit-scrollbar-thumb:hover]:bg-[#3d5570]">
                    {selectedClothes.map((clothes) => (
                      <div key={clothes.id} className="flex items-center gap-3 rounded-[10px] bg-white p-2">
                        <div className="size-10 shrink-0 overflow-hidden rounded-[8px] bg-[#e7e7e9]">
                          {clothes.imageUrl && <img src={clothes.imageUrl} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <p className="min-w-0 flex-1 truncate font-semibold text-[#575765] text-[13px]">{clothes.name}</p>
                        <button
                          type="button"
                          onClick={() => toggleClothes(clothes.id)}
                          className="shrink-0 text-[#808089] text-[13px] hover:text-[#3d5570]"
                        >
                          해제
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="flex flex-1 items-center justify-center text-center text-[#808089] text-[14px]">
                    왼쪽 옷장에서<br />고정할 옷을 선택하세요.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setIsClothesPickerOpen(false)}
                  className="mt-4 h-[40px] rounded-[10px] bg-white font-bold text-[#3d5570] text-[14px]"
                >
                  선택 완료
                </button>
              </aside>
            </div>
          )}
          {isClothesPickerOpen && (
            <p className="text-[#808089] text-[13px]">
              카테고리별 한 벌만 고정할 수 있어요. 바지와 스커트는 함께 선택할 수 없으며, 원피스는 상의·바지·스커트와 함께 선택할 수 없어요.
            </p>
          )}
        </section>
        )}

        <div className="flex justify-end gap-3 border-t border-[#e5ddd2] pt-6">
          <button
            type="button"
            onClick={isFinalConfirmationOpen ? () => setIsFinalConfirmationOpen(false) : onClose}
            disabled={recommending}
            className="h-[50px] min-w-[126px] rounded-[10px] bg-[#f2ede5] px-[18px] font-bold text-[#60738d] text-[17px] disabled:opacity-50"
          >
            {isFinalConfirmationOpen ? '이전' : '취소'}
          </button>
          <button
            type="button"
            onClick={isFinalConfirmationOpen ? onConfirm : openFinalConfirmation}
            disabled={loadingUsage || unavailable || recommending}
            className="h-[50px] min-w-[170px] rounded-[10px] bg-[#0f2a44] px-[18px] font-bold text-white text-[17px] hover:bg-[#3d5570] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {recommending ? '추천 중...' : '추천받기'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    ALL: '전체',
  };

  return labels[category] ?? category;
}

function belongsToCategory(clothesType: string, category: string) {
  const categoryValues: Record<string, string[]> = {
    '상의': ['상의', 'TOP'],
    '바지': ['바지', 'PANTS', 'BOTTOM'],
    '스커트': ['스커트', 'SKIRT'],
    '아우터': ['아우터', 'OUTER'],
    '원피스/세트': ['원피스/세트', 'DRESS'],
    '모자': ['모자', 'HAT'],
    '신발': ['신발', 'SHOES'],
    '가방': ['가방', 'BAG'],
    '악세서리': ['악세서리', 'ACCESSORY'],
  };

  return categoryValues[category]?.includes(clothesType) ?? false;
}

function getSelectionBlockedReason(candidate: ClothesDto, selectedClothes: ClothesDto[]) {
  const candidateCategory = normalizeCategory(candidate.type);
  const selectedCategories = selectedClothes.map(clothes => normalizeCategory(clothes.type));

  if (candidateCategory !== 'ACCESSORY' && selectedCategories.includes(candidateCategory)) {
    return '같은 카테고리의 옷은 한 벌만 선택할 수 있습니다.';
  }

  const hasPantsOrSkirt = selectedCategories.some(category => category === 'PANTS' || category === 'SKIRT');
  if ((candidateCategory === 'PANTS' || candidateCategory === 'SKIRT') && hasPantsOrSkirt) {
    return '바지와 스커트는 함께 선택할 수 없습니다.';
  }

  const hasBasicClothes = selectedCategories.some(category => ['TOP', 'PANTS', 'SKIRT'].includes(category));
  if (candidateCategory === 'DRESS' && hasBasicClothes) {
    return '원피스는 상의·바지·스커트와 함께 선택할 수 없습니다.';
  }

  if (['TOP', 'PANTS', 'SKIRT'].includes(candidateCategory) && selectedCategories.includes('DRESS')) {
    return '상의·바지·스커트는 원피스와 함께 선택할 수 없습니다.';
  }

  return undefined;
}

function normalizeCategory(category: string) {
  const aliases: Record<string, string> = {
    '상의': 'TOP', TOP: 'TOP',
    '바지': 'PANTS', PANTS: 'PANTS', BOTTOM: 'PANTS',
    '스커트': 'SKIRT', SKIRT: 'SKIRT',
    '아우터': 'OUTER', OUTER: 'OUTER',
    '원피스/세트': 'DRESS', DRESS: 'DRESS',
    '모자': 'HAT', HAT: 'HAT',
    '신발': 'SHOES', SHOES: 'SHOES',
    '가방': 'BAG', BAG: 'BAG',
    '악세서리': 'ACCESSORY', ACCESSORY: 'ACCESSORY',
  };

  return aliases[category] ?? category;
}
