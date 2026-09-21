import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useClothesStore } from '@/lib/stores/useClothesStore';
import { useClothesAttributeDefStore } from '@/lib/stores/useClothesAttributeDefStore';
import { updateClothes } from '@/lib/api/clothes';
import { toast } from 'sonner';
import type { ClothesDto, ClothesType, ClothesAttributeDto } from '@/lib/api/types';

import closeIcon from '@/assets/icons/ic_X.svg'
import emptyImageIcon from '@/assets/icons/empty image.svg'

const CLOTHES_TYPES = [
  { label: '상의', value: '상의' as ClothesType },
  { label: '바지', value: '바지' as ClothesType },
  { label: '치마', value: '치마' as ClothesType },
  { label: '아우터', value: '아우터' as ClothesType },
  { label: '원피스', value: '원피스' as ClothesType },
  { label: '신발', value: '신발' as ClothesType },
  { label: '모자', value: '모자' as ClothesType },
  { label: '가방', value: '가방' as ClothesType },
  { label: '악세서리', value: '악세서리' as ClothesType },
];

interface EditClothesModalProps {
  open: boolean;
  onClose: () => void;
  clothes: ClothesDto | null;
}

export default function EditClothesModal({ open, onClose, clothes }: EditClothesModalProps) {
  const { update } = useClothesStore();
  const { data: attributeDefs, fetch: fetchAttributes } = useClothesAttributeDefStore();
  const [loading, setLoading] = useState(false);
  const { selectedImage, imagePreview, handleImageChange, clearImage } = useImageUpload();
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    type: '' as ClothesType,
    season: '',
    gender: '',
    attributes: [] as ClothesAttributeDto[],
    description: '',
    isOwned: true,
    preference: 3
  });
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 의상 속성 정의 로드
  useEffect(() => {
    if (open) {
      fetchAttributes();
    }
  }, [open, fetchAttributes]);

  // 모달이 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (open && clothes) {
      setFormData({
        name: clothes.name,
        brand: clothes.brand ?? '',
        type: clothes.type,
        season: clothes.season ?? '',
        gender: clothes.gender ?? '',
        attributes: clothes.attributes,
        description: clothes.description ?? '',
        isOwned: clothes.isOwned ?? true,
        preference: clothes.preference ?? 3
      });
      
      // 기존 속성들을 selectedAttributes로 변환
      const existingAttributes: Record<string, string> = {};
      clothes.attributes.forEach(attr => {
        if (attr.definitionId) {
          existingAttributes[attr.definitionId] = attr.value;
        }
      });
      setSelectedAttributes(existingAttributes);
      
      clearImage();
    }
  }, [open, clothes, clearImage]);

  // 선택된 속성들을 ClothesAttributeDto 배열로 변환
  const convertSelectedAttributesToDto = (): ClothesAttributeDto[] => {
    if (!selectedAttributes) return [];

    return Object.entries(selectedAttributes)
      .filter(([, value]) => value && value.trim())
      .map(([definitionId, value]) => ({definitionId, value}));
  };

  // 수정 저장
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clothes || !formData.name || !formData.type) return;

    setLoading(true);
    try {
      const attributes = convertSelectedAttributesToDto();
      const updatedClothes = await updateClothes(clothes.id, {
        name: formData.name,
        brand: formData.brand,
        type: formData.type,
        season: formData.season,
        gender: formData.gender,
        attributes: attributes,
        description: formData.description,
        isOwned: formData.isOwned,
        preference: formData.preference
      }, selectedImage || undefined);
      
      update(updatedClothes.id, updatedClothes);
      toast.success('옷이 성공적으로 수정되었습니다.');
      handleClose();
    } catch (error) {
      console.error('옷 수정 실패:', error);
      toast.error('옷 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    clearImage();
    setFormData({
      name: '',
      brand: '',
      type: '' as ClothesType,
      season: '',
      gender: '',
      attributes: [],
      description: '',
      isOwned: true,
      preference: 3
    });
    setSelectedAttributes({});
    onClose();
  };

  if (!clothes) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="max-w-[550px] p-0 bg-transparent border-none" showCloseButton={false}>
        <div className="bg-white box-border content-stretch flex flex-col gap-6 items-center justify-start p-[30px] relative rounded-[20px] shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)] w-full max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
              <div className="w-[30px]" />
              <DialogTitle className="font-bold leading-none not-italic relative shrink-0 text-gray-800 text-[22px] text-nowrap tracking-[-0.55px]">
                옷 수정
              </DialogTitle>
              <DialogClose asChild>
                <button className="overflow-clip relative shrink-0 size-[30px] hover:bg-gray-100 rounded transition-colors">
                  <div className="absolute inset-[20.834%]">
                    <img alt="닫기" className="block max-w-none size-full" src={closeIcon} />
                  </div>
                </button>
              </DialogClose>
            </div>

            {/* 이미지 업로드 */}
            <div className="box-border content-stretch flex flex-col items-end justify-start pb-[26px] pt-0 px-0 relative shrink-0 w-[100px] self-center">
              <div className="aspect-square bg-gray-300 mb-[-26px] relative rounded-[100px] shrink-0 w-full overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                ) : clothes.imageUrl ? (
                  <img src={clothes.imageUrl} alt={clothes.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="aspect-square overflow-clip relative size-full flex items-center justify-center">
                    <div className="absolute inset-[29.167%] overflow-clip">
                      <div className="absolute inset-[8.333%]">
                        <img alt="사진 업로드" className="block max-w-none size-full" src={emptyImageIcon} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 box-border content-stretch flex flex-col gap-2 items-center justify-center mb-[-26px] overflow-clip px-3 py-1.5 relative rounded-[100px] shrink-0 transition-colors"
              >
                <div className="flex flex-col font-bold justify-center leading-none not-italic relative shrink-0 text-[16px] text-white tracking-[-0.4px] w-full">
                  <p className="leading-normal">변경</p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <form onSubmit={handleSave} className="w-full flex flex-col gap-6">
              {/* 이름 */}
              <div className="content-stretch flex flex-col gap-2.5 items-start justify-start relative shrink-0 w-full">
                <div className="font-bold leading-none not-italic relative shrink-0 text-gray-500 text-[14px] tracking-[-0.35px] w-full">
                  <p className="leading-normal">이름</p>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="이름을 입력해주세요"
                  className="bg-white box-border content-stretch flex h-[46px] items-center justify-between px-5 py-3.5 relative rounded-[12px] shrink-0 w-full border border-gray-200 shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* 브랜드 */}
              <div className="content-stretch flex flex-col gap-2.5 items-start justify-start relative shrink-0 w-full">
                <label htmlFor="edit-clothes-brand" className="font-bold leading-none not-italic relative shrink-0 text-gray-500 text-[14px] tracking-[-0.35px] w-full">
                  브랜드
                </label>
                <input
                  id="edit-clothes-brand"
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="브랜드를 입력해주세요"
                  className="bg-white box-border content-stretch flex h-[46px] items-center justify-between px-5 py-3.5 relative rounded-[12px] shrink-0 w-full border border-gray-200 shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 종류 */}
              <div className="content-stretch flex flex-col gap-2.5 items-start justify-start relative shrink-0 w-full">
                <div className="font-bold leading-none not-italic relative shrink-0 text-gray-500 text-[14px] tracking-[-0.35px] w-full">
                  <p className="leading-normal">종류</p>
                </div>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as ClothesType }))} required>
                  <SelectTrigger className="bg-white box-border content-stretch flex h-[46px] items-center justify-between px-5 py-3.5 relative rounded-[12px] shrink-0 w-full border border-gray-200 shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)]">
                    <SelectValue placeholder="종류를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLOTHES_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="cursor-pointer hover:bg-gray-50 hover:shadow-sm transition-colors">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="content-stretch flex flex-col gap-2.5 items-start justify-start relative shrink-0 w-full">
                  <label htmlFor="edit-clothes-season" className="font-bold leading-none text-gray-500 text-[14px] tracking-[-0.35px] w-full">
                    계절
                  </label>
                  <input
                    id="edit-clothes-season"
                    type="text"
                    value={formData.season}
                    onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
                    placeholder="예: 가을"
                    className="bg-white h-[46px] px-5 py-3.5 rounded-[12px] w-full border border-gray-200 shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="content-stretch flex flex-col gap-2.5 items-start justify-start relative shrink-0 w-full">
                  <label htmlFor="edit-clothes-gender" className="font-bold leading-none text-gray-500 text-[14px] tracking-[-0.35px] w-full">
                    성별
                  </label>
                  <input
                    id="edit-clothes-gender"
                    type="text"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    placeholder="예: 남성"
                    className="bg-white h-[46px] px-5 py-3.5 rounded-[12px] w-full border border-gray-200 shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 설명 */}
              <div className="content-stretch flex flex-col gap-2.5 items-start justify-start relative shrink-0 w-full">
                <label htmlFor="edit-clothes-description" className="font-bold leading-none not-italic relative shrink-0 text-gray-500 text-[14px] tracking-[-0.35px] w-full">
                  설명
                </label>
                <textarea
                  id="edit-clothes-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="의상에 대한 설명을 입력해주세요"
                  rows={3}
                  className="bg-white box-border resize-y min-h-[92px] px-5 py-3.5 rounded-[12px] w-full border border-gray-200 shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 보유 여부 */}
              <label className="content-stretch flex items-center justify-between relative shrink-0 w-full cursor-pointer">
                <span className="font-bold text-gray-500 text-[14px] tracking-[-0.35px]">보유 여부</span>
                <span className="flex items-center gap-2 text-[14px] text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isOwned}
                    onChange={(e) => setFormData(prev => ({ ...prev, isOwned: e.target.checked }))}
                    className="size-4 accent-blue-500 cursor-pointer"
                  />
                  보유함
                </span>
              </label>

              {/* 선호도 */}
              <div className="content-stretch flex flex-col gap-2.5 items-start justify-start relative shrink-0 w-full">
                <div className="flex items-center justify-between w-full">
                  <label htmlFor="edit-clothes-preference" className="font-bold text-gray-500 text-[14px] tracking-[-0.35px]">선호도</label>
                  <span className="font-semibold text-blue-500 text-[14px]">{formData.preference} / 5</span>
                </div>
                <input
                  id="edit-clothes-preference"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={formData.preference}
                  onChange={(e) => setFormData(prev => ({ ...prev, preference: Number(e.target.value) }))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between w-full px-0.5 text-[12px] text-gray-400">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
              </div>

              {/* 의상 속성 Select들 */}
              {attributeDefs && attributeDefs.length > 0 && (
                <div className="content-stretch flex flex-col gap-5 items-start justify-start relative shrink-0 w-full">
                  {attributeDefs.map((attrDef) => (
                    <div key={attrDef.id} className="content-stretch flex flex-col gap-2.5 items-start justify-start relative shrink-0 w-full">
                      <div className="font-bold leading-none not-italic relative shrink-0 text-gray-500 text-[14px] tracking-[-0.35px] w-full">
                        <p className="leading-normal truncate">{attrDef.name}</p>
                      </div>
                      <Select 
                        value={selectedAttributes[attrDef.id] || ""} 
                        onValueChange={(value) => 
                          setSelectedAttributes(prev => ({ ...prev, [attrDef.id]: value }))
                        }
                      >
                        <SelectTrigger className="bg-white box-border content-stretch flex h-[46px] items-center justify-between px-5 py-3.5 relative rounded-[12px] shrink-0 w-full border border-gray-200 shadow-[0px_2px_4px_0px_rgba(55,55,64,0.03)]">
                          <SelectValue placeholder={`${attrDef.name}를 선택해주세요`} />
                        </SelectTrigger>
                        <SelectContent>
                          {attrDef.selectableValues.map((value) => (
                            <SelectItem key={value} value={value} className="cursor-pointer hover:bg-gray-50 hover:shadow-sm transition-colors">
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}

              {/* 하단 버튼 */}
              <div className="box-border content-stretch flex gap-3 items-center justify-end pb-0 pt-1.5 px-0 relative shrink-0 w-full">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="secondary"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name || !formData.type}
                  variant="primary"
                >
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </div>
            </form>
          </div>
      </DialogContent>
    </Dialog>
  );
}
