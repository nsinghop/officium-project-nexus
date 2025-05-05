
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/PageLayout";
import { useUserStore } from "@/store/userStore";
import { useProjectStore, ProjectStatus } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell } from "recharts";

// Example colors for the pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useUserStore();
  const { projects, getProjectsByStatus } = useProjectStore();
  const { tasks, getTasksByUser } = useTaskStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Prepare data for project status chart
  const projectStatusCounts = [
    { name: "Ongoing", value: getProjectsByStatus("ongoing").length },
    { name: "Completed", value: getProjectsByStatus("completed").length },
    { name: "Upcoming", value: getProjectsByStatus("upcoming").length }
  ];

  // Prepare data for user tasks
  const userTasks = currentUser ? getTasksByUser(currentUser.id) : [];
  
  // Group tasks by status
  const taskStatusCounts = {
    todo: userTasks.filter(task => task.status === "todo").length,
    in_progress: userTasks.filter(task => task.status === "in_progress").length,
    review: userTasks.filter(task => task.status === "review").length,
    done: userTasks.filter(task => task.status === "done").length,
  };

  const taskStatusData = [
    { name: "To Do", value: taskStatusCounts.todo },
    { name: "In Progress", value: taskStatusCounts.in_progress },
    { name: "Review", value: taskStatusCounts.review },
    { name: "Done", value: taskStatusCounts.done },
  ];

  // Get recent projects
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Projects</CardTitle>
              <CardDescription>All managed projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">My Tasks</CardTitle>
              <CardDescription>Tasks assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userTasks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completed Projects</CardTitle>
              <CardDescription>Successfully delivered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {projectStatusCounts[1].value}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>Distribution of projects by status</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusCounts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Your Task Status</CardTitle>
              <CardDescription>Distribution of your tasks by status</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Tasks" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Recently created or updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-md border p-4"
                >
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.description.substring(0, 60)}
                      {project.description.length > 60 ? "..." : ""}
                    </p>
                  </div>
                  <div className="flex items-center">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
