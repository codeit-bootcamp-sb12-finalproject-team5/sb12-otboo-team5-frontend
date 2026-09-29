import { useEffect, useState } from 'react';
import { createFeedComment } from '@/lib/api/feeds';
import { toast } from 'sonner';
import { useFeedCommentStore } from '@/lib/stores/useFeedCommentStore';
import { useFeedStore } from '@/lib/stores/useFeedStore';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import type { FeedDto } from '@/lib/api/types';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import { MessageCircle, Send } from 'lucide-react';

interface FeedCommentsProps {
  feed: FeedDto;
}

export default function FeedComments({ feed }: FeedCommentsProps) {
  const { data: comments, loading, add, updateParams, fetchMore, hasNext } = useFeedCommentStore();
  const { update: updateFeed } = useFeedStore();
  const { data: auth } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    updateParams({ feedId: feed.id });
  }, [feed.id, updateParams]);

  // 무한 스크롤 설정
  const { ref: infiniteScrollRef } = useInfiniteScroll({
    onLoadMore: () => {
      fetchMore();
    },
    rootMargin: '50px',
    threshold: 0.1
  });

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !auth) return;
    
    try {
      setSubmitting(true);
      const newComment = await createFeedComment(feed.id, {
        feedId: feed.id,
        authorId: auth.userDto.id,
        content: commentText.trim(),
      });
      
      add(newComment);
      updateFeed(feed.id, { commentCount: feed.commentCount + 1 });
      setCommentText('');
      toast.success('댓글이 등록되었습니다.');
    } catch (error) {
      console.error(error);
      toast.error('댓글 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="shrink-0 pb-2">
        <p className="text-[15px] font-bold text-[#0f2a44]">댓글 {feed.commentCount}</p>
      </div>

      {/* 댓글 목록 */}
      <div className="mb-2.5 flex min-h-0 w-full flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" >
        {comments.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-[#f7f7f8]"><MessageCircle className="size-9 text-[#7a8ca3]" /></div>
            <p className="font-semibold text-[#3d5570]">첫 댓글을 작성해보세요!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="box-border content-stretch flex items-start justify-between pb-5 pt-0 px-1.5 relative shrink-0 w-full">
                <div className="content-stretch flex w-full gap-2.5 items-start justify-start relative">
                  <div className="content-stretch flex w-full gap-2.5 items-start justify-start relative">
                    <div className="flex shrink-0 items-center">
                      <div className="relative size-9 shrink-0 rounded-full bg-[#a9a9b1]">
                        <ProfileAvatar imageUrl={comment.author.profileImageUrl} alt={comment.author.name} className="w-full h-full rounded-[100px] object-cover" />
                      </div>
                    </div>
                    <div className="content-stretch flex min-w-0 flex-1 flex-col gap-1 items-start justify-start leading-[0] not-italic relative">
                      <div className="flex w-full items-center justify-between gap-3">
                        <div className="font-['SUIT:Bold',_sans-serif] relative shrink-0 font-bold text-[#575765] text-[16px] tracking-[-0.4px]">
                          <p className="leading-[normal] text-nowrap whitespace-pre">{comment.author.name}</p>
                        </div>
                        <div className="font-['SUIT:SemiBold',_sans-serif] relative shrink-0 text-[#808089] text-[11px] tracking-[-0.25px]">
                          <p className="leading-[normal] text-nowrap whitespace-pre">{formatDate(comment.createdAt)}</p>
                        </div>
                      </div>
                      <div className="font-['SUIT:SemiBold',_sans-serif] relative text-[#34343d] text-[16px] tracking-[-0.4px] break-words w-full">
                        <p className="leading-[1.4]">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 무한 스크롤 트리거 - 항상 렌더링 */}
            <div ref={infiniteScrollRef} className="flex items-center justify-center py-4">
              {hasNext() ? (
                loading ? (
                  <span className="text-[#a9a9b1] text-[14px]">댓글을 더 불러오는 중...</span>
                ) : (
                  <div className="h-4 text-[#a9a9b1] text-[12px]">트리거 (hasNext: true)</div>
                )
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* 댓글 입력 - 50px 고정 높이, 하단 고정 */}
      <div className="mt-auto w-full shrink-0">
        <div className="flex h-[64px] items-center gap-3 rounded-[16px] border border-[#e7e7e9] bg-[#fdfdfa] px-3">
          <div className="flex h-[48px] flex-1 items-center rounded-full border border-[#ded6cb] bg-white px-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="댓글을 입력해주세요"
              disabled={submitting}
              className="flex-1 border-none bg-transparent text-[16px] text-[#131316] shadow-none outline-none placeholder:text-[#808089] focus:ring-0"
            />
          </div>
          <button onClick={handleSubmitComment} disabled={submitting || !commentText.trim()} aria-label="댓글 등록" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0f2a44] text-white disabled:opacity-40"><Send className="size-5 -translate-x-0.5" /></button>
        </div>
      </div>
    </div>
  );
}
