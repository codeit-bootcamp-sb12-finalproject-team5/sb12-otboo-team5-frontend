import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import profileIcon from '@/assets/icons/profile.svg';
import sendIcon from '@/assets/icons/ic_send.svg';
import {createDmRoom, getDmMessages, markDmMessagesRead} from '@/lib/api/messages';
import type {DmMessage} from '@/lib/api/types';
import {useWebSocketStore} from '@/lib/stores/websocketStore';
import {useAuthStore} from '@/lib/stores/useAuthStore';

interface DMModalProps { open: boolean; onOpenChange: (open: boolean) => void; targetUser: {id: string; name: string; profileImageUrl?: string} | null; roomId?: string; dmKey?: string; }

export default function DMModal({open, onOpenChange, targetUser, roomId, dmKey}: DMModalProps) {
  const {send, connect, isConnected, subscribe, unsubscribe} = useWebSocketStore();
  const currentUserId = useAuthStore(state => state.data?.userDto?.id);
  const accessToken = useAuthStore(state => state.data?.accessToken);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [content, setContent] = useState('');
  const [createdRoom, setCreatedRoom] = useState<{roomId: string; dmKey: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeRoom = roomId && dmKey ? {roomId, dmKey} : createdRoom;

  useEffect(() => {
    if (open && accessToken && !isConnected) connect(accessToken);
  }, [open, accessToken, isConnected, connect]);

  const loadMessages = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await getDmMessages(id);
      setMessages(response.messages);
      const lastMessage = response.messages.at(-1);
      if (lastMessage) await markDmMessagesRead(id, lastMessage.messageId);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!open || !targetUser) return;
    const initialize = async () => {
      const nextRoom = roomId && dmKey ? {roomId, dmKey} : await createDmRoom(targetUser.id);
      if (!roomId || !dmKey) setCreatedRoom(nextRoom);
      await loadMessages(nextRoom.roomId);
    };
    initialize().catch(console.error);
  }, [open, targetUser, roomId, dmKey, loadMessages]);

  useLayoutEffect(() => {
    if (loading || messages.length === 0) return;
    const frame = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({block: 'end', behavior: 'auto'});
    });
    return () => cancelAnimationFrame(frame);
  }, [loading, messages]);

  useEffect(() => {
    if (!open || !activeRoom) return;
    const destination = `/sub/direct-messages_${activeRoom.dmKey}`;
    subscribe(destination, (message: DmMessage) => setMessages(previous => previous.some(item => item.messageId === message.messageId) ? previous : [...previous, message]));
    return () => unsubscribe(destination);
  }, [open, activeRoom?.dmKey, subscribe, unsubscribe]);

  const sendMessage = () => {
    if (!activeRoom || !targetUser || !content.trim() || !isConnected) return;
    send('/pub/direct-messages_send', {roomId: activeRoom.roomId, receiverId: targetUser.id, content: content.trim()});
    setContent('');
  };
  if (!targetUser) return null;

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-white w-[600px] h-[510px] max-w-[min(600px,90vw)] p-0 gap-0 rounded-[30px] border-0 flex overflow-hidden" showCloseButton={false}>
      <div className="flex flex-col h-full w-full">
        <header className="flex gap-2 items-center px-5 py-3 border-b border-[#e7e7e9]"><img src={targetUser.profileImageUrl || profileIcon} alt="" className="size-[30px] rounded-full object-cover bg-[#a9a9b1]" /><strong className="text-[#34343d] text-[18px]">{targetUser.name}</strong></header>
        <section className="flex-1 overflow-y-auto px-5 py-6">
          {loading ? <p className="text-center text-[#808089]">메시지를 불러오는 중...</p> : messages.length === 0 ? <p className="h-full flex items-center justify-center text-center text-[#a9a9b1] text-[20px] font-bold">{targetUser.name} 님과의 대화를 시작해보세요</p> : <div className="flex flex-col gap-[18px]">{messages.map(message => <div key={message.messageId} className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] px-[18px] py-3 rounded-[16px] text-[16px] ${message.senderId === currentUserId ? 'bg-[#1e89f4] text-white' : 'bg-[#f2f2f3] text-[#212126]'}`}>{message.content}</div></div>)}<div ref={messagesEndRef} /></div>}
        </section>
        <div className="px-5 py-3 border-t border-[#e7e7e9]"><div className="flex items-center h-[54px] rounded-full border border-[#e7e7e9] pl-5 pr-3"><input value={content} onChange={event => setContent(event.target.value)} onKeyDown={event => {if (event.key === 'Enter') {event.preventDefault(); sendMessage();}}} placeholder="메시지 입력..." className="flex-1 outline-none bg-transparent" /><button onClick={sendMessage} disabled={!content.trim() || !isConnected} className="p-2 disabled:opacity-40"><img src={sendIcon} alt="메시지 보내기" className="size-5" /></button></div></div>
      </div>
    </DialogContent>
  </Dialog>;
}
