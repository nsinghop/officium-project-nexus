
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isAnnouncement: boolean;
}

interface MessageState {
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp" | "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
  getMessagesBySender: (senderId: string) => Message[];
  getAnnouncements: () => Message[];
  removeMessage: (id: string) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: [
        {
          id: "1",
          senderId: "1",
          content: "Welcome to the team! Please check the project requirements.",
          timestamp: "2023-11-01T09:00:00Z",
          isRead: false,
          isAnnouncement: true,
        },
        {
          id: "2",
          senderId: "2",
          content: "I've completed the first phase of the website redesign.",
          timestamp: "2023-11-05T14:30:00Z",
          isRead: true,
          isAnnouncement: false,
        },
        {
          id: "3",
          senderId: "1",
          content: "Project deadline approaching! Please submit your work by Friday.",
          timestamp: "2023-11-10T11:15:00Z",
          isRead: false,
          isAnnouncement: true,
        },
      ],
      
      addMessage: (message) => {
        const newMessage = { 
          ...message, 
          id: Date.now().toString(), 
          timestamp: new Date().toISOString(),
          isRead: false,
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      },
      
      markAsRead: (id) => {
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id ? { ...message, isRead: true } : message
          ),
        }));
      },
      
      markAllAsRead: () => {
        set((state) => ({
          messages: state.messages.map((message) => ({ ...message, isRead: true })),
        }));
      },
      
      getUnreadCount: () => {
        return get().messages.filter((message) => !message.isRead).length;
      },
      
      getMessagesBySender: (senderId) => {
        return get().messages.filter((message) => message.senderId === senderId);
      },
      
      getAnnouncements: () => {
        return get().messages.filter((message) => message.isAnnouncement);
      },
      
      removeMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== id),
        }));
      },
    }),
    {
      name: "message-storage",
    }
  )
);
