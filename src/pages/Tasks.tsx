
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useTaskStore, TaskStatus, TaskPriority, Task } from "@/store/taskStore";
import { useUserStore } from "@/store/userStore";
import { useProjectStore } from "@/store/projectStore";
import { Calendar, Clock, Plus } from "lucide-react";

const Tasks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');
  
  const { isAuthenticated, currentUser, users } = useUserStore();
  const { projects, getProjectById } = useProjectStore();
  const { tasks, addTask, updateTask, getTasksByUser, getTasksByProject } = useTaskStore();
  const { toast } = useToast();
  
  const [currentTab, setCurrentTab] = useState<TaskStatus>("todo");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(projectIdFromUrl);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New task form state
  const [newTask, setNewTask] = useState({
    projectId: projectIdFromUrl || "",
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium" as TaskPriority,
    status: "todo" as TaskStatus,
    dueDate: "",
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    filterTasks();
  }, [currentTab, selectedProject, tasks, currentUser, searchQuery]);
  
  useEffect(() => {
    if (projectIdFromUrl) {
      setSelectedProject(projectIdFromUrl);
      setNewTask(prev => ({ ...prev, projectId: projectIdFromUrl }));
    }
  }, [projectIdFromUrl]);
  
  const filterTasks = () => {
    let filtered = [...tasks];
    
    // Filter by status
    filtered = filtered.filter(task => task.status === currentTab);
    
    // Filter by selected project
    if (selectedProject) {
      filtered = filtered.filter(task => task.projectId === selectedProject);
    }
    
    // Filter by user if not founder
    if (currentUser && currentUser.role !== "founder") {
      filtered = filtered.filter(task => task.assignedTo === currentUser.id);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredTasks(filtered);
  };
  
  const handleAddTask = () => {
    if (!newTask.projectId || !newTask.title || !newTask.assignedTo || !newTask.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    addTask(newTask);
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Task added successfully",
    });
    
    // Reset form except projectId if from URL
    setNewTask({
      projectId: projectIdFromUrl || "",
      title: "",
      description: "",
      assignedTo: "",
      priority: "medium",
      status: "todo",
      dueDate: "",
    });
  };
  
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
    toast({
      title: "Task Updated",
      description: `Task status changed to ${newStatus.replace('_', ' ')}`,
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // Get project options for select
  const projectOptions = projects.map(project => ({
    id: project.id,
    name: project.name,
  }));
  
  // Get employee options for select
  const employeeOptions = users
    .filter(user => user.role === "employee")
    .map(employee => ({
      id: employee.id,
      name: employee.name,
    }));
  
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            {selectedProject && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Project:</span>
                <span className="font-medium">
                  {getProjectById(selectedProject)?.name || "Unknown Project"}
                </span>
                {selectedProject && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto px-1 py-0 text-xs"
                    onClick={() => {
                      setSelectedProject(null);
                      setNewTask(prev => ({ ...prev, projectId: "" }));
                    }}
                  >
                    (clear)
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search tasks..."
              className="max-w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {!selectedProject && (
              <Select
                value={selectedProject || ""}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedProject(value);
                    setNewTask(prev => ({ ...prev, projectId: value }));
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to your project.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project">Project</Label>
                    <Select
                      value={newTask.projectId}
                      onValueChange={(value) => setNewTask({ ...newTask, projectId: value })}
                      disabled={!!projectIdFromUrl}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter task description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="assignee">Assigned To</Label>
                      <Select
                        value={newTask.assignedTo}
                        onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employeeOptions.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => 
                          setNewTask({ ...newTask, priority: value as TaskPriority })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask}>Create Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs defaultValue="todo" value={currentTab} onValueChange={(value) => setCurrentTab(value as TaskStatus)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab} className="mt-6">
            {filteredTasks.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">
                  No {currentTab.replace('_', ' ')} tasks found
                </p>
                <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>
                  Add a new task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => {
                  const project = getProjectById(task.projectId);
                  const assignee = users.find((user) => user.id === task.assignedTo);
                  
                  return (
                    <Card key={task.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription>
                              {project ? `Project: ${project.name}` : "No project"}
                            </CardDescription>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span>
                                Due: <span className="font-medium">{formatDate(task.dueDate)}</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span>
                                Created: <span className="font-medium">{formatDate(task.createdAt)}</span>
                              </span>
                            </div>
                            
                            <div>
                              Assigned to: <span className="font-medium">{assignee?.name || "Unassigned"}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {currentTab !== "todo" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(task.id, "todo")}
                              >
                                Move to Todo
                              </Button>
                            )}
                            
                            {currentTab !== "in_progress" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(task.id, "in_progress")}
                              >
                                Move to In Progress
                              </Button>
                            )}
                            
                            {currentTab !== "review" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(task.id, "review")}
                              >
                                Move to Review
                              </Button>
                            )}
                            
                            {currentTab !== "done" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(task.id, "done")}
                              >
                                Mark as Done
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Tasks;
