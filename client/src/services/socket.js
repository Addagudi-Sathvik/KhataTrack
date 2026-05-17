import { io } from 'socket.io-client';
import { getAccessToken } from './tokenStore.js';

let socket;

export function getSocket() {
  const token = getAccessToken();
  if (!token) return null;
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket']
    });
  }
  return socket;
}

export function closeSocket() {
  socket?.disconnect();
  socket = null;
}
