
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "founder" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  position?: string;
  category?: "Intern" | "Full-Time" | "Part-Time" | "Contractor";
  avatar?: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  removeUser: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: "1",
          name: "John Smith",
          email: "founder@example.com",
          role: "founder",
        },
        {
          id: "2",
          name: "Jane Doe",
          email: "employee@example.com",
          role: "employee",
          position: "Developer",
          category: "Full-Time",
        },
      ],
      currentUser: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        // Mock login - in a real app this would call an API
        const users = get().users;
        const user = users.find((u) => u.email === email);
        
        // Simple mock authentication
        if (user && password === "password") {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
      
      addUser: (userData) => {
        const newUser = { 
          id: Date.now().toString(),
          ...userData 
        };
        set((state) => ({ users: [...state.users, newUser] }));
      },
      
      updateUser: (id, userData) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...userData } : user
          ),
        }));
      },
      
      removeUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }));
      },
    }),
    {
      name: "user-storage",
    }
  )
);
