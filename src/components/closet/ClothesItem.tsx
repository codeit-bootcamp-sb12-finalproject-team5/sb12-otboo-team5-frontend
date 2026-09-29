import { type PointerEvent, useRef } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { ClothesDto } from '@/lib/api/types';

interface ClothesItemProps {
  clothes: ClothesDto;
  isOwner?: boolean;
  onEdit?: (clothes: ClothesDto) => void;
  onDelete?: (clothes: ClothesDto) => void;
}

export default function ClothesItem({ clothes, isOwner = false, onEdit, onDelete }: ClothesItemProps) {
  const tagListRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0, active: false });

  const handleTagPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const list = tagListRef.current;
    if (!list || event.button !== 0) return;

    dragStartRef.current = { x: event.clientX, scrollLeft: list.scrollLeft, active: true };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleTagPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const list = tagListRef.current;
    if (!list || !dragStartRef.current.active) return;
    list.scrollLeft = dragStartRef.current.scrollLeft - (event.clientX - dragStartRef.current.x);
  };

  const handleTagPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    dragStartRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="content-stretch flex flex-col gap-1.5 items-start justify-start relative w-full group">
      {/* 이미지 */}
      <div className="aspect-square bg-gray-200 rounded-[10px] shrink-0 w-full overflow-hidden relative">
        {clothes.imageUrl ? (
          <img 
            src={clothes.imageUrl} 
            alt={clothes.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <div className="text-gray-500 text-sm">이미지 없음</div>
          </div>
        )}

        {/* 미트볼 메뉴 - 내 옷인 경우에만 표시 */}
        {isOwner && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="bg-white/90 backdrop-blur-sm hover:bg-white size-8 rounded-full flex items-center justify-center shadow-md transition-colors">
                  <MoreVertical className="size-4 text-gray-700" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(clothes);
                  }}
                >
                  <Edit className="size-4 mr-2" />
                  수정
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(clothes);
                  }}
                >
                  <Trash2 className="size-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* 제목 */}
      <div className="font-bold leading-none not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-gray-900 text-[14px] text-nowrap tracking-[-0.35px] w-full">
        <p className="text-overflow-inherit text-wrap-mode-inherit white-space-collapse-inherit leading-normal overflow-inherit truncate">
          {clothes.name}
        </p>
      </div>

      {/* 속성 태그들 */}
      <div className="relative shrink-0 w-full">
        <div
          ref={tagListRef}
          onPointerDown={handleTagPointerDown}
          onPointerMove={handleTagPointerMove}
          onPointerUp={handleTagPointerEnd}
          onPointerCancel={handleTagPointerEnd}
          className="content-stretch flex cursor-grab touch-pan-y select-none gap-1.5 items-center justify-start overflow-x-auto [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          {clothes.attributes.map((attribute, index) => (
            <div 
              key={index}
              className="box-border content-stretch flex gap-1 items-center justify-center px-1.5 py-0.5 relative rounded-[5px] shrink-0 border border-gray-300"
            >
              <div className="font-semibold leading-none not-italic relative shrink-0 text-gray-500 text-[11px] tracking-[-0.25px] w-full">
                <p className="leading-normal">{attribute.value}</p>
              </div>
            </div>
          ))}
          {/* 페이드 효과를 위한 스페이서 */}
          <div className="shrink-0 w-8 h-1" />
        </div>
        {/* 오른쪽 페이드 효과 */}
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
