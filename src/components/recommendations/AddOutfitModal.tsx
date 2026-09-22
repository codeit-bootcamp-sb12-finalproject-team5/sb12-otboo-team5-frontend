import {useEffect, useState} from 'react';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import {createOutfit} from '@/lib/api/outfits';
import type {RecommendedOutfitDto} from '@/lib/api';
import {toast} from 'sonner';
import {useWeatherStore} from '@/lib/stores/useWeatherStore';

interface AddOutfitModalProps {
  open: boolean;
  outfit?: RecommendedOutfitDto;
  onClose: () => void;
  category?: 'OOTD' | 'OUTFIT';
}

export default function AddOutfitModal({open, outfit, onClose, category = 'OUTFIT'}: AddOutfitModalProps) {
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
      await createOutfit({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        clothesIds: outfit.clothes.map(clothes => clothes.id),
        weatherId: category === 'OOTD' ? selectedWeather?.id : undefined,
      });
      toast.success(`${category === 'OOTD' ? 'OOTD' : '아웃핏'}가 등록되었습니다.`);
      onClose();
    } catch (error) {
      console.error('아웃핏 등록 실패:', error);
      toast.error(`${category === 'OOTD' ? 'OOTD' : '아웃핏'} 등록에 실패했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[520px] max-w-[calc(100%-2rem)] rounded-[24px] bg-white p-7 sm:max-w-[calc(100%-2rem)]" showCloseButton={false}>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-[#212126] text-[22px]">{category === 'OOTD' ? 'OOTD 등록하기' : '아웃핏 등록하기'}</h2>
            <button type="button" onClick={onClose} className="rounded-[8px] px-2 py-1 font-semibold text-[#808089] hover:bg-[#f7f7f8]">닫기</button>
          </div>
          <p className="text-[#696975] text-[14px]">현재 추천 코디의 옷 {outfit?.clothes.length ?? 0}개가 {category === 'OOTD' ? 'OOTD' : '아웃핏'}으로 저장됩니다.</p>
          <label className="flex flex-col gap-2 font-bold text-[#33333a] text-[15px]">
            {category === 'OOTD' ? 'OOTD' : '아웃핏'} 이름
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className="h-[46px] rounded-[10px] border border-[#d4d4d9] px-3 font-semibold outline-none focus:border-[#1e89f4]" />
          </label>
          <label className="flex flex-col gap-2 font-bold text-[#33333a] text-[15px]">
            설명 <span className="font-medium text-[#a9a9b1]">(선택)</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="h-[100px] resize-none rounded-[10px] border border-[#d4d4d9] p-3 font-medium outline-none focus:border-[#1e89f4]" />
          </label>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="h-[46px] rounded-[10px] bg-[#f7f7f8] px-5 font-bold text-[#575765] disabled:opacity-50">취소</button>
            <button type="button" onClick={handleSubmit} disabled={loading || !name.trim()} className="h-[46px] rounded-[10px] bg-[#1e89f4] px-5 font-bold text-white disabled:opacity-50">{loading ? '등록 중...' : `${category === 'OOTD' ? 'OOTD' : '아웃핏'} 등록`}</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
