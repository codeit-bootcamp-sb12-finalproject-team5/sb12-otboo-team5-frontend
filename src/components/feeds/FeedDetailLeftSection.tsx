import { type PointerEvent, useRef, useState } from 'react';
import type { FeedDto } from '@/lib/api/types';
import leftArrowIcon from '@/assets/icons/ic_left.svg';
import rightArrowIcon from '@/assets/icons/ic_right.svg';
import emptyImageIcon from '@/assets/icons/empty image.svg';
import { getFeedImages } from './feedImages';

interface FeedDetailLeftSectionProps {
  feed: FeedDto;
}

export default function FeedDetailLeftSection({ feed }: FeedDetailLeftSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbnailListRef = useRef<HTMLDivElement>(null);
  const thumbnailDragStartRef = useRef<{ x: number; scrollLeft: number } | null>(null);
  const tagDragStartRef = useRef<{ x: number; scrollLeft: number } | null>(null);
  
  const images = getFeedImages(feed);
  const currentOotd = images[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const startThumbnailDrag = (event: PointerEvent<HTMLDivElement>) => {
    thumbnailDragStartRef.current = { x: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
  };
  const dragThumbnails = (event: PointerEvent<HTMLDivElement>) => {
    const start = thumbnailDragStartRef.current;
    if (start) event.currentTarget.scrollLeft = start.scrollLeft - (event.clientX - start.x);
  };
  const endThumbnailDrag = () => { thumbnailDragStartRef.current = null; };
  const startTagDrag = (event: PointerEvent<HTMLDivElement>) => {
    tagDragStartRef.current = { x: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
  };
  const dragTags = (event: PointerEvent<HTMLDivElement>) => {
    const start = tagDragStartRef.current;
    if (start) event.currentTarget.scrollLeft = start.scrollLeft - (event.clientX - start.x);
  };
  const endTagDrag = () => { tagDragStartRef.current = null; };

  return (
    <div className="flex min-w-0 flex-[1.08] flex-col pr-5">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {/* 메인 이미지 영역 - 600x600 정사각형 */}
        {currentOotd?.imageUrl ? (
          <div className="relative min-h-[360px] w-full flex-1 bg-transparent bg-contain bg-center bg-no-repeat" 
               style={{ backgroundImage: `url('${currentOotd.imageUrl}')` }}>
            
            {/* 네비게이션 화살표 - OOTD가 2개 이상일 때만 표시 */}
            {images.length > 1 && (
              <>
                {/* 왼쪽 화살표 */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-3 top-1/2 size-12 -translate-y-1/2 rounded-full bg-white/90 shadow-[0px_4px_12px_rgba(15,42,68,0.16)]"
                >
                  <div className="absolute overflow-clip size-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img src={leftArrowIcon} alt="이전" className="block max-w-none size-full" />
                  </div>
                </button>

                {/* 오른쪽 화살표 */}
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 size-12 -translate-y-1/2 rounded-full bg-white/90 shadow-[0px_4px_12px_rgba(15,42,68,0.16)]"
                >
                  <div className="absolute overflow-clip size-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img src={rightArrowIcon} alt="다음" className="block max-w-none size-full" />
                  </div>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="relative flex min-h-[360px] w-full flex-1 items-center justify-center bg-transparent">
            <img src={emptyImageIcon} alt="이미지 없음" className="w-16 h-16" />
            
            {/* 이미지가 없을 때도 화살표 표시 */}
            {images.length > 1 && (
              <>
                {/* 왼쪽 화살표 */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-3 top-1/2 size-12 -translate-y-1/2 rounded-full bg-white/90 shadow-[0px_4px_12px_rgba(15,42,68,0.16)]"
                >
                  <div className="absolute overflow-clip size-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img src={leftArrowIcon} alt="이전" className="block max-w-none size-full" />
                  </div>
                </button>

                {/* 오른쪽 화살표 */}
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 size-12 -translate-y-1/2 rounded-full bg-white/90 shadow-[0px_4px_12px_rgba(15,42,68,0.16)]"
                >
                  <div className="absolute overflow-clip size-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img src={rightArrowIcon} alt="다음" className="block max-w-none size-full" />
                  </div>
                </button>
              </>
            )}
          </div>
        )}

        {/* OOTD 아이템 정보 - 고정 높이 */}
        <div className="flex h-[106px] w-full shrink-0 flex-col items-start gap-3 px-1 pb-3 pt-4">
          {currentOotd ? (
            <>
              <div className="font-['SUIT:Bold',_sans-serif] leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[24px] text-black text-nowrap tracking-[-0.6px] w-full">
                <p className="leading-[normal] overflow-ellipsis overflow-hidden truncate">{currentOotd.name}</p>
              </div>
              <div className="relative shrink-0 w-full">
                <div onPointerDown={startTagDrag} onPointerMove={dragTags} onPointerUp={endTagDrag} onPointerCancel={endTagDrag} onPointerLeave={endTagDrag} className="content-stretch flex min-h-[26px] gap-1.5 items-center justify-start overflow-x-auto touch-pan-y select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {currentOotd.attributes?.map((attribute, index) => (
                    <div key={index} className="bg-white box-border content-stretch flex gap-1 items-center justify-center px-1.5 py-1 relative rounded-[7px] shrink-0">
                      <div aria-hidden="true" className="absolute border border-[#d4d4d9] border-solid inset-0 pointer-events-none rounded-[7px]" />
                      <div className="font-['SUIT:SemiBold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#808089] text-[14px] text-center text-nowrap tracking-[-0.35px]">
                        <p className="leading-[normal] whitespace-pre">{attribute.value}</p>
                      </div>
                    </div>
                  ))}
                  {/* 페이드 효과를 위한 스페이서 */}
                  <div className="shrink-0 w-8 h-1" />
                </div>
                {/* 오른쪽 페이드 효과 */}
                <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-[#a9a9b1] text-[14px]">의상 정보가 없습니다</span>
            </div>
          )}
        </div>

        {/* OOTD 썸네일들 - 100x100 원형 */}
        <div ref={thumbnailListRef} onPointerDown={startThumbnailDrag} onPointerMove={dragThumbnails} onPointerUp={endThumbnailDrag} onPointerCancel={endThumbnailDrag} onPointerLeave={endThumbnailDrag} className="flex shrink-0 items-start gap-2.5 overflow-x-auto px-1 py-3 touch-pan-y select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((ootd, index) => {
            const isSelected = currentIndex === index;
            const hasImage = !!ootd.imageUrl;
            
            return (
              <button
                key={ootd.key}
                aria-label={ootd.name}
                onClick={() => handleThumbnailClick(index)}
                className="relative size-[100px] shrink-0 cursor-pointer rounded-[10px] transition-opacity hover:opacity-80"
              >
                {hasImage ? (
                  <>
                    <div 
                      className="size-full rounded-[10px] bg-cover bg-center bg-no-repeat" 
                      style={{ backgroundImage: `url('${ootd.imageUrl}')` }}
                    />
                    {isSelected && (
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[10px] border-4 border-solid border-[#3d5570]" />
                    )}
                  </>
                ) : (
                  <div className={`rounded-[16px] size-full flex items-center justify-center relative ${
                    isSelected ? 'bg-[#f2ede5]' : 'bg-[#f7f7f8]'
                  }`}>
                    <img src={emptyImageIcon} alt="이미지 없음" className="w-8 h-8" />
                    {isSelected && (
                      <div aria-hidden="true" className="absolute border-4 border-[#3d5570] border-solid inset-0 pointer-events-none rounded-[16px]" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* 구분선 */}
      <div aria-hidden="true" className="absolute border-[0px_1px_0px_0px] border-[rgba(34,34,55,0.06)] border-solid inset-0 pointer-events-none" />
    </div>
  );
}
