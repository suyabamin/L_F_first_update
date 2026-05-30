import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (url) => {
  const socket = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.current = io(url || window.location.origin, {
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true
    });

    socket.current.on('connect', () => {
      setConnected(true);
      console.log('[SOCKET] Connected');
    });

    socket.current.on('disconnect', () => {
      setConnected(false);
      console.log('[SOCKET] Disconnected');
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [url]);

  return { socket: socket.current, connected };
};
