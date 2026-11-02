import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from './config';

let socket: Socket | null = null;

// One shared, authenticated connection for the whole app.
export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(SERVER_URL, { auth: { token }, transports: ['websocket'] });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
