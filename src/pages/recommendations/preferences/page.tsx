import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updateRecommendationPreferences } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { RecommendationPreferenceRequest } from '@/lib/api/types';

type PreferenceKey = keyof RecommendationPreferenceRequest;

const PREFERENCE_FIELDS: Array<{
  key: PreferenceKey;
  title: string;
  description: string;
  values: string[];
}> = [
  {
    key: 'subcategories',
    title: '선호하는 아이템',
    description: '평소 즐겨 입는 아이템을 모두 골라주세요.',
    values: [
      '긴소매티', '스웨트셔츠', '셔츠/블라우스', '후드티', '반소매티', '카라티', '니트', '민소매티',
      '후드집업', '블루종', '레더', '슈트재킷', '카디건', '경량패딩', '헌팅재킷', '트러커재킷',
      '스타디움재킷', '나일론재킷', '트레이닝재킷', '아노락재킷', '플리스', '환절기코트', '베스트',
      '무스탕', '싱글코트', '더블코트', '기타코트', '롱패딩', '숏패딩', '데님팬츠', '조거팬츠',
      '코튼팬츠', '슈트팬츠', '숏팬츠', '레깅스', '점프슈트', '미니스커트', '미디스커트', '롱스커트',
      '미니원피스', '미디원피스', '맥시원피스', '메신저백', '숄더백', '백팩', '토트백', '에코백',
      '보스턴백', '웨이스트백', '파우치', '브리프케이스', '캐리어', '클러치백', '캡', '베레모', '페도라',
      '버킷', '비니', '트루퍼', '바라클라바', '스니커즈', '스포츠', '구두', '부츠', '샌들', '패딩',
      '머플러', '주얼리', '안경', '시계', '벨트', '기타',
    ],
  },
  {
    key: 'colors',
    title: '좋아하는 색상',
    description: '옷을 고를 때 자주 손이 가는 색상을 골라주세요.',
    values: [
      '블랙', '화이트', '다크그레이', '그레이', '네이비', '아이보리', '라이트그레이', '카키', '베이지',
      '블루', '다크네이비', '브라운', '다크브라운', '버건디', '스카이블루', '그린', '다크그린',
      '올리브그린', '레드', '다크블루', '오트밀', '민트', '퍼플', '다크베이지', '핑크', '오렌지',
      '라이트핑크', '라이트그린', '옐로우', '딥레드', '라이트브라운', '다크핑크', '샌드', '라이트옐로우',
      '머스타드', '라벤더', '라임', '다크오렌지', '카멜', '브릭', '실버', '라이트오렌지', '페일핑크',
      '피치', '데님', '카키베이지', '흑청', '연청', '중청', '골드', '클리어', '기타',
    ],
  },
  {
    key: 'fits',
    title: '선호하는 핏',
    description: '내가 편안하고 잘 어울린다고 느끼는 핏을 골라주세요.',
    values: ['스탠다드', '오버사이즈', '슬림', '와이드'],
  },
  {
    key: 'materials',
    title: '좋아하는 소재',
    description: '촉감이나 계절감 때문에 선호하는 소재를 골라주세요.',
    values: [
      '면', '폴리에스테르', '스판덱스', '나일론', '니트', '레이온', '아크릴', '기모', '울', '텐셀',
      '폴리우레탄', '메시', '데님', '캐시미어', '면혼방', '플리스', '알파카', '모헤어', '실크',
      '코듀로이', '벨벳', '기타',
    ],
  },
  {
    key: 'patterns',
    title: '좋아하는 패턴',
    description: '자주 찾는 디자인과 패턴을 골라주세요.',
    values: [
      '로고/그래픽', '단색/무지', '스트라이프', '가먼트다잉', '컬러블록', '체크', '플라워', '도트',
      '카모플라쥬', '그라데이션', '드로잉', '디스트로이드', '레터링', '기타',
    ],
  },
  {
    key: 'styles',
    title: '선호하는 스타일',
    description: '나를 가장 잘 표현하는 스타일을 골라주세요.',
    values: ['캐주얼', '스트릿', '고프코어', '워크웨어', '프레피', '시티보이', '스포티', '로맨틱', '클래식', '미니멀', '시크', '레트로', '기타'],
  },
];

const EMPTY_PREFERENCES: RecommendationPreferenceRequest = {
  subcategories: [],
  colors: [],
  fits: [],
  materials: [],
  patterns: [],
  styles: [],
};

export default function RecommendationPreferencesPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<RecommendationPreferenceRequest>(EMPTY_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);

  const togglePreference = (key: PreferenceKey, value: string) => {
    setPreferences((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((selected) => selected !== value)
        : [...current[key], value],
    }));
  };

  const selectedCount = Object.values(preferences).reduce((count, values) => count + values.length, 0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await updateRecommendationPreferences(preferences);
      toast.success('선호도가 저장되었습니다. 이제 더 알맞은 옷을 추천해드릴게요.');
      navigate('/recommendations', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '선호도 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fc] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl pb-8">
        <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#e9f4ff] to-white px-6 py-7 sm:px-8">
          <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-[#3182f6] text-white shadow-lg shadow-blue-200">
            <Sparkles className="size-5" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-[-0.7px] text-[#34343d] sm:text-3xl">나에게 맞는 옷을 찾아볼까요?</h1>
          <p className="mt-2 text-sm font-medium tracking-[-0.3px] text-[#6b7280] sm:text-base">
            좋아하는 스타일을 알려주시면 날씨와 취향에 맞춰 더 좋은 추천을 준비할게요. 여러 개를 선택해도 됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {PREFERENCE_FIELDS.map((field) => (
            <section key={field.key} className="rounded-2xl border border-[#e7e9ee] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-lg font-extrabold tracking-[-0.45px] text-[#34343d]">{field.title}</h2>
                <span className="text-sm font-semibold text-[#3182f6]">{preferences[field.key].length}개 선택</span>
              </div>
              <p className="mb-4 text-sm font-medium tracking-[-0.3px] text-[#858590]">{field.description}</p>
              <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1">
                {field.values.map((value) => {
                  const isSelected = preferences[field.key].includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => togglePreference(field.key, value)}
                      className={cn(
                        'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold tracking-[-0.3px] transition-colors',
                        isSelected
                          ? 'border-[#3182f6] bg-[#e9f4ff] text-[#1d6fd8]'
                          : 'border-[#e0e2e7] bg-white text-[#666672] hover:border-[#9fc7fa] hover:bg-[#f5f9ff]',
                      )}
                    >
                      {isSelected && <Check className="size-3.5" aria-hidden="true" />}
                      {value}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="sticky bottom-0 flex flex-col gap-3 rounded-2xl border border-[#e7e9ee] bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm font-semibold text-[#666672]">
              총 <span className="text-[#3182f6]">{selectedCount}개</span>의 선호도를 선택했어요.
            </p>
            <div className="flex gap-2 sm:w-auto">
              <Button type="button" variant="secondary" className="flex-1 sm:flex-none" onClick={() => navigate('/recommendations')}>
                다음에 할게요
              </Button>
              <Button type="submit" className="flex-1 sm:flex-none" disabled={isSaving}>
                {isSaving ? '저장 중...' : '선호도 저장'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
