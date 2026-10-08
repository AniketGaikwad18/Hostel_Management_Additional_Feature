'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getWsUrl } from '@/lib/api';

interface SocketMessage {
  type: string;
  payload: any;
}

type MessageHandler = (payload: any) => void;

interface SocketContextType {
  isConnected: boolean;
  subscribe: (type: string, handler: MessageHandler) => () => void;
  lastMessage: SocketMessage | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const listenersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let unmounted = false;

    function connect() {
      if (unmounted) return;
      try {
        const wsUrl = getWsUrl();
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data: SocketMessage = JSON.parse(event.data);
            setLastMessage(data);

            const handlers = listenersRef.current.get(data.type);
            if (handlers) {
              handlers.forEach((fn) => fn(data.payload));
            }
          } catch (e) {
            console.error('WebSocket parse error:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (!unmounted) {
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (e) {
        if (!unmounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const subscribe = (type: string, handler: MessageHandler) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type)!.add(handler);

    return () => {
      const set = listenersRef.current.get(type);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          listenersRef.current.delete(type);
        }
      }
    };
  };

  return (
    <SocketContext.Provider value={{ isConnected, subscribe, lastMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function useSocketListener(type: string, handler: MessageHandler) {
  const { subscribe } = useSocket();
  useEffect(() => {
    const unsubscribe = subscribe(type, handler);
    return () => unsubscribe();
  }, [type, handler, subscribe]);
}
