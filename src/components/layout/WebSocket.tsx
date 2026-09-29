import { useWebSocketStore } from "@/lib/stores/websocketStore";
import {useAuthStore} from "@/lib/stores/useAuthStore.ts";
import {useEffect} from "react";

export default function WebSocket() {
  const { connect, disconnect } = useWebSocketStore();
  const { isAuthenticated, getAccessToken } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) {
      connect(getAccessToken() as string);
    }
    return () => {
      disconnect();
    };
  }, [connect, disconnect, isAuthenticated, getAccessToken]);

  return null;
}
