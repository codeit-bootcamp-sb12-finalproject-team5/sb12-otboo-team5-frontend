import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Heart } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useFeedStore } from '@/lib/stores/useFeedStore';
import { updateFeed, deleteFeed, likeFeed, unlikeFeed } from '@/lib/api/feeds';
import type { FeedDto } from '@/lib/api/types';
import FeedComments from './FeedComments';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import sunnyIcon from '@/assets/illust_logos/il_Sunny.svg';
import overcastIcon from '@/assets/illust_logos/il_Overcast.svg';
import cloudyIcon from '@/assets/illust_logos/il_cloudy.svg';
import {toast} from "sonner";

interface FeedDetailRightSectionProps {
  feed: FeedDto;
  onDelete?: () => void;
}

function WeatherIcon({ skyStatus }: { skyStatus: string }) {
  switch (skyStatus) {
    case 'CLEAR':
      return <img alt="맑음" className="block max-w-none size-full" src={sunnyIcon} />;
    case 'MOSTLY_CLOUDY':
      return <img alt="구름많음" className="block max-w-none size-full" src={cloudyIcon} />;
    case 'CLOUDY':
      return <img alt="흐림" className="block max-w-none size-full" src={overcastIcon} />;
    default:
      return <img alt="맑음" className="block max-w-none size-full" src={sunnyIcon} />;
  }
}

export default function FeedDetailRightSection({ feed, onDelete }: FeedDetailRightSectionProps) {
  const { data: currentUser } = useAuthStore();
  const { update, delete: deleteFeedFromStore, loading } = useFeedStore();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(feed.content);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const isOwner = currentUser?.userDto?.id === feed.author.userId;

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      setContent(feed.content);
      return;
    }

    if (content.trim() === feed.content.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      const updatedFeed = await updateFeed(feed.id, { content: content.trim() });
      update(feed.id, updatedFeed);
      setIsEditing(false);
    } catch (error) {
      console.error('피드 수정 실패:', error);
      // 에러 처리 (토스트 등)
      toast.error("피드 수정에 실패했습니다.")
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setContent(feed.content);
  };

  const handleDeleteClick = () => {
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteFeed = async () => {
    try {
      setDeleteLoading(true);
      await deleteFeed(feed.id);
      deleteFeedFromStore(feed.id);
      setIsDeleteAlertOpen(false);
      toast.success('피드가 삭제되었습니다.');
      // 피드 상세 페이지에서 목록으로 돌아가는 로직 필요
    } catch (error) {
      console.error('피드 삭제 실패:', error);
      toast.error('피드 삭제에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
      if (onDelete) {
        onDelete();
      }
    }
  };

  const handleLike = async () => {
    try {
      if (feed.likedByMe) {
        await unlikeFeed(feed.id);
        update(feed.id, { likedByMe: false, likeCount: feed.likeCount - 1 });
      } else {
        await likeFeed(feed.id);
        update(feed.id, { likedByMe: true, likeCount: feed.likeCount + 1 });
      }
    } catch {
      toast.error('좋아요 처리 중 오류가 발생했습니다.');
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return {
      date: `${month}월 ${day}일`,
      time: `${hours}:${minutes}`
    };
  };

  const { date, time } = formatDate(feed.createdAt);

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-[16px] border border-[#e7e7e9] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,68,0.04)]">
      {/* 작성자 정보 - 60px 고정 높이 */}
      <div className="shrink-0">
        <div className="flex items-center justify-between border-b border-[#e7e7e9] pb-3">
          <div className="content-stretch flex gap-1.5 items-start justify-start relative shrink-0">
            <div className="flex shrink-0 items-center">
              <div className="relative size-12 shrink-0 rounded-full bg-[#a9a9b1]">
                <ProfileAvatar imageUrl={feed.author.profileImageUrl} alt={feed.author.name} className="w-full h-full rounded-[100px] object-cover" />
              </div>
            </div>
            <div className="flex h-12 w-[120px] shrink-0 flex-col justify-center gap-1">
              <div className="font-['SUIT:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#34343d] text-[16px] text-nowrap tracking-[-0.4px]">
                <p className="leading-[normal] whitespace-pre">{feed.author.name}</p>
              </div>
              <div className="content-stretch flex font-['SUIT:SemiBold',_sans-serif] gap-1 items-center justify-start leading-[0] not-italic relative shrink-0 text-[#808089] text-[14px] text-nowrap tracking-[-0.35px] w-full">
                <div className="relative shrink-0">
                  <p className="leading-[normal] text-nowrap whitespace-pre">{date}</p>
                </div>
                <div className="relative shrink-0">
                  <p className="leading-[normal] text-nowrap whitespace-pre">{time}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {feed.weather && (
              <div className="bg-[#f7f7f8] box-border content-stretch flex gap-[3px] items-center justify-start pl-2.5 pr-3.5 py-1.5 relative rounded-[10px] shrink-0">
                <div className="overflow-clip relative shrink-0 size-6">
                  <WeatherIcon skyStatus={feed.weather.skyStatus} />
                </div>
                <div className="font-['SUIT:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#424242] text-[14px] text-center text-nowrap tracking-[-0.35px]">
                  <p className="leading-[normal] whitespace-pre">{Math.round(feed.weather.temperature.current)}°</p>
                </div>
              </div>
            )}
            
            {/* 미트볼 메뉴 - 내 피드인 경우에만 표시 */}
            {isOwner && (
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="bg-white backdrop-blur-sm size-8 rounded-full flex items-center justify-center shadow-md cursor-pointer">
                      <MoreVertical className="size-4 text-gray-700" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                      }}
                    >
                      <Edit className="size-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick();
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
        </div>
        {/* 콘텐츠 섹션 */}
        <div className="max-h-[130px] w-full overflow-y-auto py-3">
        {isEditing ? (
          <div className="space-y-2 mt-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[80px] p-2 border border-gray-300 rounded-md resize-none font-['SUIT:SemiBold',_sans-serif] text-[16px] tracking-[-0.4px] focus:outline-none focus:ring-2 focus:ring-[#3d5570] focus:border-transparent"
              placeholder="내용을 입력하세요..."
              disabled={loading}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-[#3d5570] text-white rounded hover:bg-[#0f2a44] transition-colors disabled:opacity-50"
                disabled={loading || content.trim() === ''}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        ) : (
          <div className="font-['SUIT:SemiBold',_sans-serif] leading-[1.4] not-italic text-[#131316] text-[16px] tracking-[-0.4px] break-words">
            <p className="leading-[1.4]">{content}</p>
          </div>
        )}
        </div>
        <div className="flex items-center py-2 text-[#3d5570]">
          <button type="button" onClick={handleLike} className="flex items-center gap-1.5 transition-opacity hover:opacity-70">
            <Heart className={`size-4 ${feed.likedByMe ? 'fill-[#e76f51] text-[#e76f51]' : ''}`} />
            <span className="text-xs font-semibold">좋아요 {feed.likeCount}개</span>
          </button>
        </div>
      </div>

      {/* 댓글 섹션 - 나머지 공간 모두 차지 */}
      <div className="mt-4 min-h-0 w-full flex-1 border-t border-[#e7e7e9] pt-4">
        <FeedComments feed={feed} />
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>피드를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 피드와 관련된 모든 댓글이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFeed}
              disabled={deleteLoading}
            >
              {deleteLoading ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
