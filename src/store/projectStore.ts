
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProjectStatus = "ongoing" | "completed" | "upcoming";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  deadline: string;
  teamMembers: string[]; // User IDs
  leadId: string; // User ID of project lead
  progress: number; // 0-100
  createdAt: string;
}

interface ProjectState {
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "createdAt" | "progress">) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByStatus: (status: ProjectStatus) => Project[];
  getProjectsByUser: (userId: string) => Project[];
  updateProjectProgress: (id: string, progress: number) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [
        {
          id: "1",
          name: "Website Redesign",
          description: "Complete overhaul of company website",
          status: "ongoing",
          deadline: "2023-12-31",
          teamMembers: ["2", "3"],
          leadId: "2",
          progress: 65,
          createdAt: "2023-05-15",
        },
        {
          id: "2",
          name: "Mobile App Development",
          description: "Develop a new mobile app for clients",
          status: "upcoming",
          deadline: "2024-03-15",
          teamMembers: ["2", "4"],
          leadId: "4",
          progress: 0,
          createdAt: "2023-06-01",
        },
        {
          id: "3",
          name: "Database Migration",
          description: "Migrate from SQL to NoSQL database",
          status: "completed",
          deadline: "2023-04-30",
          teamMembers: ["2", "3", "4"],
          leadId: "3",
          progress: 100,
          createdAt: "2023-01-10",
        },
      ],
      
      addProject: (project) => {
        const newProject = { 
          ...project, 
          id: Date.now().toString(), 
          createdAt: new Date().toISOString(),
          progress: project.status === "completed" ? 100 : 0
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },
      
      updateProject: (id, projectData) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...projectData } : project
          ),
        }));
      },
      
      removeProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },
      
      getProjectById: (id) => {
        return get().projects.find((project) => project.id === id);
      },
      
      getProjectsByStatus: (status) => {
        return get().projects.filter((project) => project.status === status);
      },
      
      getProjectsByUser: (userId) => {
        return get().projects.filter((project) => 
          project.teamMembers.includes(userId) || project.leadId === userId
        );
      },
      
      updateProjectProgress: (id, progress) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id 
              ? { 
                  ...project, 
                  progress,
                  status: progress >= 100 ? "completed" : project.status
                } 
              : project
          ),
        }));
      },
    }),
    {
      name: "project-storage",
    }
  )
);
