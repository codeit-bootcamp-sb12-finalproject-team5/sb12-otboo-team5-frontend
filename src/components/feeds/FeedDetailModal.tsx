import type { FeedDto } from '@/lib/api/types';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import FeedDetailLeftSection from './FeedDetailLeftSection';
import FeedDetailRightSection from './FeedDetailRightSection';
import { useFeedStore } from '@/lib/stores/useFeedStore';

interface FeedDetailModalProps {
  feed: FeedDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeedDetailModal({ feed, open, onOpenChange }: FeedDetailModalProps) {
  const feeds = useFeedStore(state => state.data);
  if (!feed) return null;
  const currentFeed = feeds.find(item => item.id === feed.id) ?? feed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle/>
      <DialogContent 
        className="h-[700px] w-[1000px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[12px] border border-[#e7e7e9] bg-white p-4 sm:max-w-[calc(100vw-2rem)]"
        showCloseButton={false}
      >
        <div className="flex size-full min-h-0 gap-5 overflow-hidden">
          {/* 왼쪽 섹션 - OOTD 캐러셀 (531px) */}
          <FeedDetailLeftSection feed={currentFeed} />
          {/* 오른쪽 섹션 - 피드 정보 & 댓글 (367px) */}
          <FeedDetailRightSection feed={currentFeed} onDelete={() => onOpenChange(false)} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[12px] border border-[#e7e7e9]" />
      </DialogContent>
    </Dialog>
  );
}
