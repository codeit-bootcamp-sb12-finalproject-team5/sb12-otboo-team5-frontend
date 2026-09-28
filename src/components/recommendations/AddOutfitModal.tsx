import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import {createOutfit} from '@/lib/api/outfits';
import type {OutfitCreateResponse, RecommendedOutfitDto} from '@/lib/api';
import {toast} from 'sonner';
import {useWeatherStore} from '@/lib/stores/useWeatherStore';

interface AddOutfitModalProps {
  open: boolean;
  outfit?: RecommendedOutfitDto;
  onClose: () => void;
  onSuccess?: (outfit: OutfitCreateResponse) => void;
  category?: 'OOTD' | 'OUTFIT';
  generationMode?: 'FITTING' | 'COMPOSITION';
  generatedImageUrl?: string;
}

export default function AddOutfitModal({open, outfit, onClose, onSuccess, category = 'OUTFIT', generationMode, generatedImageUrl}: AddOutfitModalProps) {
  const navigate = useNavigate();
  const selectedWeather = useWeatherStore(state => state.selectedWeather);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && outfit) {
      setName(`추천 코디 ${outfit.rank}`);
      setDescription(outfit.reason ?? '');
    }
  }, [open, outfit]);

  const handleSubmit = async () => {
    if (!outfit || !name.trim()) {
      toast.error(`${category === 'OOTD' ? 'OOTD' : '아웃핏'} 이름을 입력해주세요.`);
      return;
    }
    if (category === 'OOTD' && !selectedWeather) {
      toast.error('선택한 날짜의 날씨 정보가 없습니다.');
      return;
    }

    setLoading(true);
    try {
      const createdOutfit = await createOutfit({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        clothesIds: outfit.clothes.map(clothes => clothes.id),
        weatherId: category === 'OOTD' ? selectedWeather?.id : undefined,
      });
      toast.success(`${category === 'OOTD' ? 'OOTD' : '아웃핏'}가 등록되었습니다.`);
      if (onSuccess) onSuccess(createdOutfit);
      else onClose();
    } catch (error) {
      console.error('아웃핏 등록 실패:', error);
      toast.error(`${category === 'OOTD' ? 'OOTD' : '아웃핏'} 등록에 실패했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  const finishGeneration = () => {
    onClose();
    navigate(`/outfits?category=${category}`);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={`${generationMode ? 'w-[620px]' : 'w-[520px]'} max-w-[calc(100%-2rem)] rounded-[12px] bg-white p-7 sm:max-w-[calc(100%-2rem)]`} showCloseButton={false}>
        {generationMode ? (
          <section className="flex min-h-[430px] flex-col rounded-[10px] bg-[#f7f7f8] p-5">
            <h2 className="text-[20px] font-extrabold text-[#3d5570]">{generationMode} 결과</h2>
            <div className="mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-[8px] border border-dashed border-[#b7a997] bg-white p-3 text-center text-[14px] leading-6 text-[#7a8ca3]">
              {generatedImageUrl ? (
                <img src={generatedImageUrl} alt={`${generationMode} 생성 결과`} className="h-full w-full object-contain" />
              ) : (
                <span>{generationMode} 생성 결과를 불러오지 못했습니다.</span>
              )}
            </div>
            <button type="button" onClick={finishGeneration} className="mt-5 h-[38px] rounded-[8px] bg-[#3d5570] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#0f2a44]">
              {generationMode} 결과까지 완료하고 {category} 페이지로 이동
            </button>
          </section>
        ) : (
          <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-extrabold text-[#212126] text-[22px]">{category === 'OOTD' ? 'OOTD 등록하기' : '아웃핏 등록하기'}</h2>
          </div>
          <p className="text-[#696975] text-[14px]">현재 추천 코디의 옷 {outfit?.clothes.length ?? 0}개가 {category === 'OOTD' ? 'OOTD' : '아웃핏'}으로 저장됩니다.</p>
          <label className="flex flex-col gap-2 font-bold text-[#33333a] text-[15px]">
            {category === 'OOTD' ? 'OOTD' : '아웃핏'} 이름
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className="h-[46px] rounded-[10px] border border-[#ded6cb] px-3 font-semibold outline-none focus:border-[#3d5570]" />
          </label>
          <label className={`flex flex-col gap-2 font-bold text-[#33333a] text-[15px] ${generationMode ? 'flex-1' : ''}`}>
            <span className="flex items-center gap-1">설명 <span className="font-medium text-[#a9a9b1]">(선택)</span></span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className={`${generationMode ? 'min-h-[100px] flex-1' : 'h-[100px]'} resize-none rounded-[10px] border border-[#ded6cb] p-3 font-medium outline-none focus:border-[#3d5570]`} />
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={handleSubmit} disabled={loading || !name.trim()} className="h-[36px] rounded-[8px] bg-[#3d5570] px-5 text-[14px] font-bold text-white hover:bg-[#0f2a44] disabled:opacity-50">{loading ? '등록 중...' : `${category === 'OOTD' ? 'OOTD' : '아웃핏'} 등록`}</button>
          </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
