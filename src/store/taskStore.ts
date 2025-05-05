
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  removeTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByUser: (userId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [
        {
          id: "1",
          projectId: "1",
          title: "Design homepage mockups",
          description: "Create mockups for the new homepage design",
          assignedTo: "2",
          priority: "high",
          status: "in_progress",
          dueDate: "2023-12-15",
          createdAt: "2023-05-20",
        },
        {
          id: "2",
          projectId: "1",
          title: "Implement responsive layout",
          description: "Make sure the website is responsive on all devices",
          assignedTo: "3",
          priority: "medium",
          status: "todo",
          dueDate: "2023-12-20",
          createdAt: "2023-06-01",
        },
        {
          id: "3",
          projectId: "3",
          title: "Data migration script",
          description: "Write script to migrate data between databases",
          assignedTo: "4",
          priority: "high",
          status: "done",
          dueDate: "2023-03-30",
          createdAt: "2023-02-15",
        },
      ],
      
      addTask: (task) => {
        const newTask = { 
          ...task, 
          id: Date.now().toString(), 
          createdAt: new Date().toISOString() 
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },
      
      updateTask: (id, taskData) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...taskData } : task
          ),
        }));
      },
      
      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },
      
      getTasksByProject: (projectId) => {
        return get().tasks.filter((task) => task.projectId === projectId);
      },
      
      getTasksByUser: (userId) => {
        return get().tasks.filter((task) => task.assignedTo === userId);
      },
      
      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status);
      },
    }),
    {
      name: "task-storage",
    }
  )
);
