import {Dialog, DialogContent} from '@/components/ui/dialog';
import type {ClothesDto, RecommendationUsage} from '@/lib/api';
import {useEffect, useState} from 'react';

const CLOSET_CATEGORIES = ['ALL', '상의', '바지', '스커트', '아우터', '원피스/세트', '모자', '신발', '가방', '악세서리'];

interface RecommendationConfirmModalProps {
  open: boolean;
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="bg-white box-border flex max-h-[calc(100vh-2rem)] flex-col gap-6 overflow-y-auto p-[30px] rounded-[30px] max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-2rem)] transition-all"
        style={{width: `${modalWidth}px`}}
        showCloseButton={false}
      >
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-[#212126] text-[22px] tracking-[-0.55px]">
            OOTD 추천 받기
          </h2>
          <p className="font-semibold text-[#575765] text-[17px] tracking-[-0.4px]">
            {dateLabel} 옷 추천을 받겠습니까?
          </p>
        </div>

        <div className="bg-[#f7f7f8] rounded-[12px] px-5 py-4 text-[#575765]">
          {loadingUsage ? (
            <p className="font-semibold">추천 가능 횟수를 확인하고 있습니다.</p>
          ) : usage ? (
            <div className="flex flex-col gap-1 font-semibold">
              <p>오늘 추천 가능 횟수: {usage.limit}회</p>
              <p>오늘 남은 추천 횟수: {usage.remaining}회</p>
            </div>
          ) : (
            <p className="font-semibold">추천 가능 횟수를 불러오지 못했습니다.</p>
          )}
        </div>

        {isFinalConfirmationOpen ? (
          <section className="flex flex-col gap-4 rounded-[16px] bg-[#f7f7f8] p-5">
            <h3 className="font-bold text-[#212126] text-[18px]">추천을 시작할까요?</h3>
            {selectedClothes.length === 0 ? (
              <p className="font-semibold leading-6 text-[#575765] text-[16px]">
                고정한 옷 없이 {dateLabel} 날씨에 맞는 코디를 추천받을까요?
              </p>
            ) : (
              <>
                <p className="font-semibold leading-6 text-[#575765] text-[16px]">
                  선택한 옷 {selectedClothes.length}개를 기반으로 {dateLabel} 코디를 추천받을까요?
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
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#212126] text-[17px]">고정할 옷 선택</h3>
              <p className="mt-1 text-[#808089] text-[14px]">선택한 옷은 추천 코디에 반드시 포함돼요.</p>
            </div>
            <span className="bg-[#e8f3ff] rounded-full px-3 py-1 font-semibold text-[#1e89f4] text-[13px]">
              {selectedClothesIds.length}개 선택
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsClothesPickerOpen(true)}
              disabled={loadingClothes || clothes.length === 0}
              className="bg-white h-[42px] rounded-[10px] border border-[#1e89f4] px-4 font-bold text-[#1e89f4] text-[15px] hover:bg-[#e8f3ff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingClothes ? '옷장 불러오는 중...' : '옷 선택하기'}
            </button>
            <button
              type="button"
              onClick={() => onToggleClothes([])}
              className="h-[42px] rounded-[10px] px-3 font-semibold text-[#808089] text-[14px] hover:bg-[#f7f7f8]"
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
            <p className="rounded-[10px] bg-[#f7f7f8] py-3 text-center font-semibold text-[#808089] text-[14px]">
              등록된 옷이 없습니다. 고정 옷 없이 추천받을 수 있어요.
            </p>
          )}

          {isClothesPickerOpen && (
            <div className="grid min-h-[360px] grid-cols-[minmax(0,1fr)_320px] gap-6 border-t border-[#e7e7e9] pt-5">
              <div className="min-w-0">
                <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                  {CLOSET_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`shrink-0 rounded-full px-4 py-2 font-semibold text-[14px] ${
                        selectedCategory === category
                          ? 'bg-[#1e89f4] text-white'
                          : 'bg-[#f7f7f8] text-[#696975] hover:bg-[#e8f3ff]'
                      }`}
                    >
                      {categoryLabel(category)}
                    </button>
                  ))}
                </div>
                <div className="grid max-h-[360px] grid-cols-3 gap-3 overflow-y-auto pr-2">
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
                        className={`relative overflow-hidden rounded-[12px] border text-left transition-all disabled:cursor-not-allowed ${
                          selected
                            ? 'border-[#1e89f4] ring-2 ring-[#1e89f4]'
                            : blockedReason
                              ? 'border-[#e7e7e9] opacity-35 grayscale'
                              : 'border-[#e7e7e9] hover:border-[#9cccfb]'
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
                          <span className="absolute right-2 top-2 rounded-full bg-[#1e89f4] px-2 py-1 font-bold text-[11px] text-white">고정</span>
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

              <aside className="flex flex-col rounded-[16px] bg-[#f7f7f8] p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#212126] text-[16px]">선택한 옷</h4>
                  <span className="font-semibold text-[#1e89f4] text-[14px]">{selectedClothes.length}개</span>
                </div>
                {selectedClothes.length > 0 ? (
                  <div className="mt-3 flex flex-1 flex-col gap-2 overflow-y-auto">
                    {selectedClothes.map((clothes) => (
                      <div key={clothes.id} className="flex items-center gap-3 rounded-[10px] bg-white p-2">
                        <div className="size-10 shrink-0 overflow-hidden rounded-[8px] bg-[#e7e7e9]">
                          {clothes.imageUrl && <img src={clothes.imageUrl} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <p className="min-w-0 flex-1 truncate font-semibold text-[#575765] text-[13px]">{clothes.name}</p>
                        <button
                          type="button"
                          onClick={() => toggleClothes(clothes.id)}
                          className="shrink-0 text-[#808089] text-[13px] hover:text-[#1e89f4]"
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
                  className="mt-4 h-[40px] rounded-[10px] bg-white font-bold text-[#1e89f4] text-[14px]"
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

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={isFinalConfirmationOpen ? () => setIsFinalConfirmationOpen(false) : onClose}
            disabled={recommending}
            className="bg-[#f7f7f8] h-[46px] px-[18px] rounded-[12px] font-bold text-[#575765] text-[18px] disabled:opacity-50"
          >
            {isFinalConfirmationOpen ? '이전' : '취소'}
          </button>
          <button
            type="button"
            onClick={isFinalConfirmationOpen ? onConfirm : openFinalConfirmation}
            disabled={loadingUsage || unavailable || recommending}
            className="bg-[#1e89f4] h-[46px] px-[18px] rounded-[12px] font-bold text-white text-[18px] disabled:opacity-50 disabled:cursor-not-allowed"
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

  if (selectedCategories.includes(candidateCategory)) {
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
