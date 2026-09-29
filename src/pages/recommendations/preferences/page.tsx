import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import OutfitImage from '@/components/outfits/OutfitImage';
import { getRecommendationPreferenceOptions, updateRecommendationPreferences } from '@/lib/api';
import type { ClothesCategory, UserPreferenceSurveyOption } from '@/lib/api/types';

const CATEGORY_LABELS: Record<ClothesCategory, string> = {
  TOP: '상의', PANTS: '바지', SKIRT: '치마', OUTER: '아우터', DRESS: '원피스',
  SHOES: '신발', HAT: '모자', BAG: '가방', ACCESSORY: '악세서리',
};
const MAX_SELECTIONS = 45;

export default function RecommendationPreferencesPage() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<UserPreferenceSurveyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getRecommendationPreferenceOptions(controller.signal)
      .then(data => {
        if (controller.signal.aborted) return;
        setOptions(data);
        setSelectedIds([]);
        setStep(0);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('설문 항목을 불러오지 못했습니다. 다시 시도해주세요.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);

  const pages = useMemo(() => {
    const groups = new Map<ClothesCategory, UserPreferenceSurveyOption[]>();
    const seenIds = new Set<string>();
    options.forEach(option => {
      if (seenIds.has(option.clothesId)) return;
      seenIds.add(option.clothesId);
      const group = groups.get(option.category) ?? [];
      group.push(option);
      groups.set(option.category, group);
    });
    // Keep every option even if the server returns more than nine for a category.
    return [...groups].flatMap(([category, items]) =>
      Array.from({ length: Math.ceil(items.length / 9) }, (_, index) => ({
        category,
        items: items.slice(index * 9, (index + 1) * 9),
      })),
    );
  }, [options]);
  const currentPage = pages[step];
  const categoryLabel = currentPage ? CATEGORY_LABELS[currentPage.category] ?? currentPage.category : '';
  const isLastStep = step === pages.length - 1;

  const moveToStep = (next: number) => {
    setStep(next);
    scrollRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus();
  };

  const toggleSelection = (id: string) => {
    if (savingRef.current) return;
    if (!selectedIds.includes(id) && selectedIds.length >= MAX_SELECTIONS) {
      toast.error('의상은 전체에서 최대 45개까지 선택할 수 있습니다.');
      return;
    }
    setSelectedIds(current => current.includes(id)
      ? current.filter(selected => selected !== id)
      : [...current, id]);
  };

  const submit = async () => {
    if (savingRef.current) return;
    if (selectedIds.length === 0 || selectedIds.length > MAX_SELECTIONS) {
      toast.error('전체 의상 중 최소 1개, 최대 45개를 선택해주세요.');
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    try {
      await updateRecommendationPreferences({ clothesIds: selectedIds });
      toast.success('선호도가 저장되었습니다.');
      navigate('/recommendations', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto bg-[#fcfaf6] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6 pb-6">
        <header>
          <h1 className="text-2xl font-extrabold text-gray-800">마음에 드는 의상을 골라주세요</h1>
          <p className="mt-3 text-gray-600">카테고리별로 여러 의상을 선택할 수 있어요. 마음에 드는 의상이 없으면 선택 없이 다음으로 넘어가세요.</p>
          <p id="selection-requirement" className="mt-2 font-semibold text-[#3d5570]">제출하려면 전체 의상 중 반드시 1개 이상 선택해야 합니다. 최대 45개까지 선택할 수 있어요.</p>
        </header>

        {loading ? (
          <div role="status" className="flex items-center justify-center gap-2 py-20 text-gray-600">
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> 설문 의상을 불러오는 중입니다.
          </div>
        ) : error || !currentPage ? (
          <div className="rounded-2xl border bg-white p-8 text-center">
            <p role={error ? 'alert' : 'status'} className="mb-4 text-gray-600">{error ?? '현재 선택할 수 있는 설문 의상이 없습니다.'}</p>
            <Button variant="secondary" onClick={() => setRevision(value => value + 1)}>다시 불러오기</Button>
          </div>
        ) : (
          <>
            <nav aria-label="설문 단계" className="flex flex-wrap gap-2">
              {pages.map((page, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={isSaving}
                  aria-current={step === index ? 'step' : undefined}
                  onClick={() => moveToStep(index)}
                  className={`rounded-full border px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${step === index ? 'border-[#3d5570] bg-[#3d5570] text-white' : 'border-[#ded6cb] bg-white text-gray-600'}`}
                >
                  {index + 1}. {CATEGORY_LABELS[page.category] ?? page.category}
                </button>
              ))}
            </nav>
            <section aria-labelledby="survey-category" aria-describedby="selection-requirement" className="rounded-2xl border border-[#ded6cb] bg-white p-4 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <h2 ref={headingRef} tabIndex={-1} id="survey-category" className="text-xl font-bold text-gray-800">{categoryLabel}</h2>
                <p className="text-sm text-gray-600" aria-live="polite">{step + 1} / {pages.length} 단계 · 이 페이지에서 {currentPage.items.filter(item => selectedIds.includes(item.clothesId)).length}개 선택</p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {currentPage.items.map((option, index) => {
                  const selected = selectedIds.includes(option.clothesId);
                  return (
                    <button
                      key={option.clothesId}
                      type="button"
                      aria-label={`${categoryLabel} 의상 ${index + 1}`}
                      aria-pressed={selected}
                      disabled={isSaving}
                      onClick={() => toggleSelection(option.clothesId)}
                      className={`relative aspect-square overflow-hidden rounded-xl border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d5570] disabled:opacity-60 ${selected ? 'border-[#3d5570] ring-2 ring-[#3d5570]' : 'border-gray-200 hover:border-[#b7a997]'}`}
                    >
                      <OutfitImage imageUrl={option.imageUrl} alt={`${categoryLabel} 의상 ${index + 1}`} className="object-contain" />
                      <span aria-hidden="true" className={`absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border ${selected ? 'border-[#3d5570] bg-[#3d5570] text-white' : 'border-gray-300 bg-white/90'}`}>
                        {selected && <Check className="size-4" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
            <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ded6cb] bg-white/95 p-4 shadow-sm">
              <p aria-live="polite" className="text-sm font-semibold text-[#3d5570]">전체 {selectedIds.length} / 45개 선택</p>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" disabled={step === 0 || isSaving} onClick={() => moveToStep(step - 1)}>이전</Button>
                {isLastStep ? (
                  <Button type="button" disabled={isSaving || selectedIds.length === 0} onClick={submit}>{isSaving ? '저장 중...' : '선호도 제출'}</Button>
                ) : (
                  <Button type="button" disabled={isSaving} onClick={() => moveToStep(step + 1)}>다음</Button>
                )}
              </div>
              {isLastStep && selectedIds.length === 0 && <p className="w-full text-sm text-red-600">제출하려면 이전 단계 또는 현재 단계에서 의상을 최소 1개 선택해주세요.</p>}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
