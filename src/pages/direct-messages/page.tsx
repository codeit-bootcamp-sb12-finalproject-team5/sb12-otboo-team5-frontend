import {useCallback, useEffect, useRef, useState} from 'react';
import profileIcon from '@/assets/icons/profile.svg';
import DMModal from '@/components/profile/DMModal';
import {getDmRooms, leaveDmRoom} from '@/lib/api/messages';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '@/components/ui/alert-dialog';
import type {DmMessage, DmRoomListItem} from '@/lib/api/types';
import {useWebSocketStore} from '@/lib/stores/websocketStore';
import {useAuthStore} from '@/lib/stores/useAuthStore';

function formatSentAt(sentAt: string) {
  const date = new Date(sentAt);
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})
    : date.toLocaleDateString('ko-KR', {month: 'long', day: 'numeric'});
}

export default function DirectMessagesPage() {
  const [rooms, setRooms] = useState<DmRoomListItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<DmRoomListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [swipedRoomId, setSwipedRoomId] = useState<string | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<DmRoomListItem | null>(null);
  const [leaving, setLeaving] = useState(false);
  const swipeStartX = useRef(0);
  const didSwipe = useRef(false);
  const {isConnected, subscribe, unsubscribe} = useWebSocketStore();
  const currentUserId = useAuthStore(state => state.data?.userDto?.id);

  const fetchRooms = useCallback(() => {
    getDmRooms().then(response => setRooms(response.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  useEffect(() => {
    const updateList = (event: Event) => {
      const detail = (event as CustomEvent<{roomId: string; dmKey: string; opponent: DmRoomListItem['opponent']; message: DmMessage}>).detail;
      setRooms(previous => {
        const nextItem: DmRoomListItem = {roomId: detail.roomId, dmKey: detail.dmKey, opponent: detail.opponent, lastMessage: {content: detail.message.content, sentAt: detail.message.createdAt}, unreadCount: 0};
        return [nextItem, ...previous.filter(item => item.roomId !== detail.roomId)];
      });
    };
    window.addEventListener('dm-list-updated', updateList);
    return () => window.removeEventListener('dm-list-updated', updateList);
  }, []);

  useEffect(() => {
    const refresh = () => fetchRooms();
    const markRoomRead = (event: Event) => {
      const {roomId} = (event as CustomEvent<{roomId: string}>).detail;
      setRooms(previous => previous.map(room => room.roomId === roomId ? {...room, unreadCount: 0} : room));
    };
    window.addEventListener('dm-list-refresh', refresh);
    window.addEventListener('dm-room-read', markRoomRead);
    return () => {
      window.removeEventListener('dm-list-refresh', refresh);
      window.removeEventListener('dm-room-read', markRoomRead);
    };
  }, [fetchRooms]);

  useEffect(() => {
    if (!isConnected || rooms.length === 0) return;
    const subscriptions = rooms.map(room => {
      const destination = `/sub/direct-messages_${room.dmKey}`;
      const handler = (message: DmMessage) => {
        setRooms(previous => previous
          .map(item => item.roomId !== room.roomId ? item : {
            ...item,
            lastMessage: {content: message.content, sentAt: message.createdAt},
            unreadCount: message.senderId === currentUserId ? item.unreadCount : item.unreadCount + 1,
          })
          .sort((left, right) => new Date(right.lastMessage.sentAt).getTime() - new Date(left.lastMessage.sentAt).getTime()));
      };
      subscribe(destination, handler);
      return {destination, handler};
    });
    return () => subscriptions.forEach(({destination, handler}) => unsubscribe(destination, handler));
  }, [isConnected, rooms, currentUserId, subscribe, unsubscribe]);

  const confirmLeave = async () => {
    if (!leaveTarget) return;
    setLeaving(true);
    try {
      await leaveDmRoom(leaveTarget.roomId);
      setRooms(previous => previous.filter(room => room.roomId !== leaveTarget.roomId));
      if (selectedRoom?.roomId === leaveTarget.roomId) setSelectedRoom(null);
      setLeaveTarget(null);
    } catch (error) {
      console.error('DM 방 나가기 실패', error);
    } finally {
      setLeaving(false);
    }
  };

  return <div className="h-full overflow-y-auto bg-white px-8 py-10">
    <div className="mx-auto w-full max-w-[760px]">
      <h1 className="mb-7 text-[24px] font-extrabold text-[#212126]">DM</h1>
      {loading ? <p className="py-10 text-center text-[#808089]">DM 목록을 불러오는 중...</p> : rooms.length === 0 ? <p className="py-16 text-center text-[#808089]">아직 대화한 DM이 없습니다.</p> : <ul className="flex flex-col gap-1">
        {rooms.map(room => <li key={room.roomId} className="relative overflow-hidden rounded-[14px]">
          <button onClick={() => setLeaveTarget(room)} className="absolute right-3 top-1/2 flex size-[56px] -translate-y-1/2 items-center justify-center rounded-full bg-[#f24346] text-sm font-bold text-white">나가기</button>
          <button onPointerDown={event => { swipeStartX.current = event.clientX; didSwipe.current = false; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={event => { const distance = event.clientX - swipeStartX.current; if (Math.abs(distance) >= 40) { didSwipe.current = true; setSwipedRoomId(distance < 0 ? room.roomId : null); } event.currentTarget.releasePointerCapture(event.pointerId); }} onClick={() => { if (didSwipe.current) { didSwipe.current = false; return; } if (swipedRoomId === room.roomId) setSwipedRoomId(null); else setSelectedRoom(room); }} className={`relative flex w-full touch-pan-y select-none items-center gap-4 rounded-[14px] bg-white px-4 py-4 text-left hover:bg-[#f7f7f8] transition-transform duration-200 ${swipedRoomId === room.roomId ? '-translate-x-[76px]' : 'translate-x-0'}`}>
            <img src={room.opponent.profileImageUrl || profileIcon} alt="" className="size-[58px] rounded-full object-cover bg-[#a9a9b1]" />
            <span className="min-w-0 flex-1"><span className="block truncate text-[18px] font-bold text-[#212126]">{room.opponent.name}</span><span className="mt-1 block truncate text-[14px] text-[#808089]">{room.lastMessage.content}</span></span>
            <span className="flex flex-col items-end gap-2"><span className="text-[12px] text-[#808089]">{formatSentAt(room.lastMessage.sentAt)}</span>{room.unreadCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">{room.unreadCount > 99 ? '99+' : room.unreadCount}</span>}</span>
          </button>
        </li>)}
      </ul>}
    </div>
    <DMModal open={selectedRoom !== null} onOpenChange={open => !open && setSelectedRoom(null)} roomId={selectedRoom?.roomId} dmKey={selectedRoom?.dmKey} targetUser={selectedRoom ? selectedRoom.opponent : null} />
    <AlertDialog open={leaveTarget !== null} onOpenChange={open => !open && !leaving && setLeaveTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>DM 방을 나갈까요?</AlertDialogTitle><AlertDialogDescription>나가면 이 대화방이 목록에서 사라집니다.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={leaving}>취소</AlertDialogCancel><AlertDialogAction onClick={confirmLeave} disabled={leaving} className="bg-[#f24346] hover:bg-[#d93639]">{leaving ? '나가는 중...' : '나가기'}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}
