import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  s.emit('join:user', userId);
};

export const joinAdminRoom = () => {
  const s = getSocket();
  s.emit('join:admin');
};

export const joinKioskRoom = () => {
  const s = getSocket();
  s.emit('join:kiosk');
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  joinUserRoom,
  joinAdminRoom,
  joinKioskRoom
};
