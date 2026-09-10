import {apiClient} from './client';
import type {DmMessageListResponse, DmRoomListResponse, DmRoomResponse} from './types';

/**
 * DM 목록 조회
 */
export const getDmRooms = async (cursor?: string): Promise<DmRoomListResponse> => {
  return apiClient.get<DmRoomListResponse>('/api/direct-messages', {params: {cursor}});
};

export const getDmMessages = async (roomId: string, cursor?: string): Promise<DmMessageListResponse> => {
  return apiClient.get<DmMessageListResponse>(`/api/direct-messages/${roomId}/messages`, {params: {cursor}});
};

export const createDmRoom = async (receiverId: string): Promise<DmRoomResponse> => {
  return apiClient.post<DmRoomResponse>('/api/direct-messages/rooms', {receiverId});
};

export const markDmMessagesRead = async (roomId: string, lastReadMessageId: string): Promise<void> => {
  await apiClient.patch<void>(`/api/direct-messages/${roomId}/read`, {lastReadMessageId});
};
