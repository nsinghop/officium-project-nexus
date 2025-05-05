
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgressBar } from "@/components/ui/progress"; // We'll create this component
import { useToast } from "@/components/ui/use-toast";
import { useProjectStore, ProjectStatus, Project } from "@/store/projectStore";
import { useUserStore, User } from "@/store/userStore";
import { useTaskStore } from "@/store/taskStore";
import { Calendar, Plus } from "lucide-react";

const Projects = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, users } = useUserStore();
  const { projects, addProject, updateProject, removeProject, getProjectsByStatus } = useProjectStore();
  const { getTasksByProject } = useTaskStore();
  const { toast } = useToast();
  
  const [currentTab, setCurrentTab] = useState<ProjectStatus>("ongoing");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // New project form state
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "upcoming" as ProjectStatus,
    deadline: "",
    teamMembers: [] as string[],
    leadId: "",
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  const handleAddProject = () => {
    if (!newProject.name || !newProject.description || !newProject.deadline || !newProject.leadId || newProject.teamMembers.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    addProject(newProject);
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Project added successfully",
    });
    
    // Reset form
    setNewProject({
      name: "",
      description: "",
      status: "upcoming",
      deadline: "",
      teamMembers: [],
      leadId: "",
    });
  };
  
  const handleViewProject = (project: Project) => {
    setViewProject(project);
    setIsViewDialogOpen(true);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // Get employees only (exclude founder)
  const employees = users.filter((user) => user.role === "employee");
  
  // Filter projects by status
  const filteredProjects = getProjectsByStatus(currentTab);
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          
          {currentUser?.role === "founder" && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to your workspace. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter project name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter project description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newProject.status}
                        onValueChange={(value) => 
                          setNewProject({ ...newProject, status: value as ProjectStatus })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newProject.deadline}
                        onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="lead">Project Lead</Label>
                    <Select
                      value={newProject.leadId}
                      onValueChange={(value) => setNewProject({ ...newProject, leadId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project lead" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.position || "Employee"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="team">Team Members</Label>
                    <Select
                      onValueChange={(value) => {
                        if (!newProject.teamMembers.includes(value)) {
                          setNewProject({ 
                            ...newProject, 
                            teamMembers: [...newProject.teamMembers, value] 
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add team members" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.position || "Employee"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {newProject.teamMembers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {newProject.teamMembers.map((memberId) => {
                          const member = users.find((user) => user.id === memberId);
                          return member ? (
                            <div
                              key={member.id}
                              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs"
                            >
                              {member.name}
                              <button
                                type="button"
                                className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                                onClick={() => 
                                  setNewProject({
                                    ...newProject,
                                    teamMembers: newProject.teamMembers.filter((id) => id !== member.id),
                                  })
                                }
                              >
                                ✕
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProject}>Create Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <Tabs defaultValue="ongoing" value={currentTab} onValueChange={(value) => setCurrentTab(value as ProjectStatus)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab} className="mt-6">
            {filteredProjects.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">No {currentTab} projects found</p>
                {currentUser?.role === "founder" && (
                  <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>
                    Add a new project
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => {
                  const projectTasks = getTasksByProject(project.id);
                  const completedTasks = projectTasks.filter((task) => task.status === "done").length;
                  const taskProgress = projectTasks.length > 0 
                    ? Math.round((completedTasks / projectTasks.length) * 100) 
                    : 0;
                  
                  const lead = users.find((user) => user.id === project.leadId);
                  const teamCount = project.teamMembers.length;
                  
                  return (
                    <Card key={project.id} className="overflow-hidden">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(project.deadline)}</span>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                project.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : project.status === "ongoing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                          </div>
                          
                          <div>
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">Lead</p>
                              <p className="text-sm font-medium">{lead?.name || "Unassigned"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Team</p>
                              <p className="text-sm font-medium">{teamCount} members</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Tasks</p>
                              <p className="text-sm font-medium">{projectTasks.length}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleViewProject(project)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Project Details Dialog */}
        {viewProject && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>{viewProject.name}</DialogTitle>
                <DialogDescription>
                  {viewProject.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{viewProject.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="font-medium">{formatDate(viewProject.deadline)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(viewProject.createdAt)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2 text-sm font-medium">Project Lead</p>
                  {users.find((user) => user.id === viewProject.leadId)?.name || "Unassigned"}
                </div>
                
                <div>
                  <p className="mb-2 text-sm font-medium">Team Members</p>
                  <div className="flex flex-wrap gap-2">
                    {viewProject.teamMembers.map((memberId) => {
                      const member = users.find((user) => user.id === memberId);
                      return member ? (
                        <div
                          key={member.id}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs"
                        >
                          {member.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">Progress</span>
                    <span>{viewProject.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${viewProject.progress}%` }}
                    />
                  </div>
                </div>
                
                {currentUser?.role === "founder" && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                      Close
                    </Button>
                    <Button 
                      variant="default" 
                      onClick={() => {
                        navigate(`/tasks?project=${viewProject.id}`);
                      }}
                    >
                      View Tasks
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageLayout>
  );
};

export default Projects;
