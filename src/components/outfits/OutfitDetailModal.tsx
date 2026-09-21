import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, LoaderCircle, MoreVertical, RefreshCw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { deleteOutfit, getOutfit } from '@/lib/api/outfits';
import type { OutfitDto } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import OutfitImage from './OutfitImage';
import OutfitWeather from './OutfitWeather';
import EditOutfitModal from './EditOutfitModal';

interface OutfitDetailModalProps {
  outfit: OutfitDto | null;
  onClose: () => void;
  onCloseAutoFocus: () => void;
  onUpdate: (outfit: OutfitDto) => void;
  onDelete: (outfitId: string) => void;
}

type DetailState =
  | { id: string; status: 'loading' | 'error' }
  | { id: string; status: 'success'; data: OutfitDto };

function OutfitDetails({ detail, summary }: { detail: OutfitDto; summary: OutfitDto }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const clothes = detail.clothes;
  const currentClothes = clothes[currentIndex];
  const summaryNames = new Map(summary.clothes.map((item) => [item.id, item.name]));
  const getClothesName = (item: OutfitDto['clothes'][number], index: number) => (
    item.name || summaryNames.get(item.id) || `의류 ${index + 1}`
  );
  const changeImage = (direction: number) => {
    if (clothes.length > 1) {
      setCurrentIndex((index) => (index + direction + clothes.length) % clothes.length);
    }
  };

  return (
    <div className="grid min-w-0 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <section
        role="region"
        aria-label="아웃핏 의류 사진"
        aria-roledescription="캐러셀"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            changeImage(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
        className="min-w-0 border-b border-[#e7e7e9] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1e89f4] md:border-r md:border-b-0"
      >
        <div className="relative aspect-square bg-[#f7f7f8]">
          <OutfitImage
            imageUrl={currentClothes?.imageUrl}
            alt={currentClothes ? getClothesName(currentClothes, currentIndex) : '등록된 의류가 없습니다'}
            className="size-full object-contain"
          />
          {clothes.length > 1 && (
            <>
              <button
                type="button"
                aria-label="이전 의류 사진"
                onClick={() => changeImage(-1)}
                className="absolute top-1/2 left-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#373740] shadow-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-[#1e89f4]"
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="다음 의류 사진"
                onClick={() => changeImage(1)}
                className="absolute top-1/2 right-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#373740] shadow-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-[#1e89f4]"
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
        <div className="flex items-start justify-between gap-3 px-5 pt-4" aria-live="polite">
          <p className="min-w-0 break-words text-base font-bold text-[#373740]">
            {currentClothes ? getClothesName(currentClothes, currentIndex) : '등록된 의류가 없습니다'}
          </p>
          {clothes.length > 0 && (
            <span className="shrink-0 text-sm text-[#808089]">{currentIndex + 1} / {clothes.length}</span>
          )}
        </div>
        {clothes.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto px-5 pt-4 pb-5" aria-label="의류 선택">
            {clothes.map((item, index) => (
              <button
                type="button"
                key={item.id}
                aria-label={`${getClothesName(item, index)} 사진 보기`}
                aria-pressed={currentIndex === index}
                onClick={() => setCurrentIndex(index)}
                className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e89f4] ${
                  currentIndex === index ? 'border-[#1e89f4]' : 'border-transparent'
                }`}
              >
                <OutfitImage imageUrl={item.imageUrl} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>
      <div className="flex min-w-0 flex-col gap-6 p-5 md:p-7 md:pt-14">
        <div>
          <h2 className="text-2xl leading-snug font-bold break-words tracking-tight text-[#373740]">
            {detail.name}
          </h2>
          <p className="mt-3 text-sm font-medium text-[#808089]">의류 {clothes.length}개</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#808089]">설명</h3>
          <p className="mt-2 leading-relaxed break-words whitespace-pre-wrap text-[#64646f]">
            {detail.description || '등록된 설명이 없습니다.'}
          </p>
        </div>
        {detail.weather && <OutfitWeather weather={detail.weather} />}
      </div>
    </div>
  );
}

export default function OutfitDetailModal({ outfit, onClose, onCloseAutoFocus, onUpdate, onDelete }: OutfitDetailModalProps) {
  const [state, setState] = useState<DetailState | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const outfitId = outfit?.id;

  useEffect(() => {
    if (!outfitId) return;

    const controller = new AbortController();
    setState({ id: outfitId, status: 'loading' });

    getOutfit(outfitId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ id: outfitId, status: 'success', data });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ id: outfitId, status: 'error' });
        }
      });

    return () => controller.abort();
  }, [outfitId, retryCount]);

  if (!outfit) return null;

  const currentState = state?.id === outfit.id ? state : null;
  const detail = currentState?.status === 'success' ? currentState.data : null;
  const isError = currentState?.status === 'error';
  const editableOutfit = detail ?? outfit;

  const handleSaved = (updatedOutfit: OutfitDto) => {
    setState({ id: updatedOutfit.id, status: 'success', data: updatedOutfit });
    onUpdate(updatedOutfit);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteOutfit(outfit.id);
      toast.success('아웃핏이 삭제되었습니다.');
      onDelete(outfit.id);
    } catch {
      toast.error('아웃핏 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onCloseAutoFocus();
        }}
        className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-[918px] gap-0 overflow-y-auto rounded-[20px] border-[#e7e7e9] bg-white p-0 sm:max-w-[918px]"
      >
        <DialogTitle className="sr-only">{detail ? `${detail.name} 상세` : '아웃핏 상세'}</DialogTitle>
        <DialogDescription className="sr-only">아웃핏을 구성하는 의류 사진과 설명, 날씨를 확인하세요.</DialogDescription>
        <DialogClose
          aria-label="아웃핏 상세 닫기"
          className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/95 text-[#64646f] shadow-sm hover:bg-[#f7f7f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e89f4]"
        >
          <X className="size-5" aria-hidden="true" />
        </DialogClose>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="아웃핏 메뉴"
              className="absolute top-3 right-14 z-10 flex size-9 items-center justify-center rounded-full bg-white/95 text-[#64646f] shadow-sm hover:bg-[#f7f7f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e89f4]"
            >
              <MoreVertical className="size-5" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
              <Edit className="size-4" /> 수정
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => setIsDeleteOpen(true)}>
              <Trash2 className="size-4" /> 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {detail ? (
          <OutfitDetails key={detail.id} detail={detail} summary={outfit} />
        ) : isError ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <p role="alert" className="text-[#64646f]">아웃핏 정보를 불러오지 못했어요.<br />잠시 후 다시 시도해 주세요.</p>
            <Button variant="secondary" onClick={() => setRetryCount((count) => count + 1)}>
              <RefreshCw className="size-4" aria-hidden="true" />
              다시 시도
            </Button>
          </div>
        ) : (
          <div role="status" className="flex min-h-80 flex-col items-center justify-center gap-3 px-6 py-16 text-[#808089]">
            <LoaderCircle className="size-7 animate-spin text-[#1e89f4]" aria-hidden="true" />
            <p>아웃핏을 불러오는 중이에요.</p>
          </div>
        )}
      </DialogContent>
      <EditOutfitModal
        outfit={editableOutfit}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSaved={handleSaved}
      />
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>아웃핏을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제한 아웃핏은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-500 hover:bg-red-600">
              {deleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
