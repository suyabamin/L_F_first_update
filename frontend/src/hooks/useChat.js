import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useSocket } from './useSocket';

export const useChat = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket, connected } = useSocket();

  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get('/conversations.php');
      if (response.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      setLoading(true);
      const response = await api.get(`/messages.php?conversation_id=${convId}`);
      if (response.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
      if (socket && connected) {
        socket.emit('conversation:join', conversationId);
      }
    }
  }, [conversationId, fetchMessages, socket, connected]);

  useEffect(() => {
    if (socket) {
      socket.on('message:new', (payload) => {
        if (String(payload.conversation_id) === String(conversationId)) {
          fetchMessages(conversationId);
        } else {
          fetchConversations();
        }
      });

      socket.on('typing:start', (payload) => {
        // Handle typing indicator
      });

      return () => {
        socket.off('message:new');
        socket.off('typing:start');
      };
    }
  }, [socket, conversationId, fetchMessages, fetchConversations]);

  const sendMessage = async (text, itemId, receiverId) => {
    try {
      const response = await api.post('/send_message.php', {
        item_id: itemId,
        receiver_id: receiverId,
        message: text
      });
      if (response.success) {
        await fetchMessages(conversationId || response.data.conversation_id);
        fetchConversations();
        return response.data;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    connected,
    fetchConversations,
    fetchMessages
  };
};
