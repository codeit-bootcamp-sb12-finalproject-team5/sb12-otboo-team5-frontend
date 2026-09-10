import {useEffect, useState} from 'react';
import profileIcon from '@/assets/icons/profile.svg';
import DMModal from '@/components/profile/DMModal';
import {getDmRooms} from '@/lib/api/messages';
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
  const {isConnected, subscribe, unsubscribe} = useWebSocketStore();
  const currentUserId = useAuthStore(state => state.data?.userDto?.id);

  useEffect(() => {
    getDmRooms().then(response => setRooms(response.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

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

  return <div className="h-full overflow-y-auto bg-white px-8 py-10">
    <div className="mx-auto w-full max-w-[760px]">
      <h1 className="mb-7 text-[24px] font-extrabold text-[#212126]">DM</h1>
      {loading ? <p className="py-10 text-center text-[#808089]">DM 목록을 불러오는 중...</p> : rooms.length === 0 ? <p className="py-16 text-center text-[#808089]">아직 대화한 DM이 없습니다.</p> : <ul className="flex flex-col">
        {rooms.map(room => <li key={room.roomId}>
          <button onClick={() => setSelectedRoom(room)} className="flex w-full items-center gap-4 rounded-[14px] px-4 py-4 text-left hover:bg-[#f7f7f8] transition-colors">
            <img src={room.opponent.profileImageUrl || profileIcon} alt="" className="size-[58px] rounded-full object-cover bg-[#a9a9b1]" />
            <span className="min-w-0 flex-1"><span className="block truncate text-[18px] font-bold text-[#212126]">{room.opponent.name}</span><span className="mt-1 block truncate text-[14px] text-[#808089]">{room.lastMessage.content}</span></span>
            <span className="flex flex-col items-end gap-2"><span className="text-[12px] text-[#808089]">{formatSentAt(room.lastMessage.sentAt)}</span>{room.unreadCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">{room.unreadCount > 99 ? '99+' : room.unreadCount}</span>}</span>
          </button>
        </li>)}
      </ul>}
    </div>
    <DMModal open={selectedRoom !== null} onOpenChange={open => !open && setSelectedRoom(null)} roomId={selectedRoom?.roomId} dmKey={selectedRoom?.dmKey} targetUser={selectedRoom ? selectedRoom.opponent : null} />
  </div>;
}
