import { io } from 'socket.io-client';
import { getAccessToken } from './tokenStore.js';

let socket;

export function getSocket() {
  const token = getAccessToken();
  if (!token) return null;
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
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
