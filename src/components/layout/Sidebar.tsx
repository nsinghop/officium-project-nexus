
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  ListCheck, 
  MessageSquare,
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 px-3 py-6 text-base font-medium transition-all",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
};

interface SidebarProps {
  userRole: "founder" | "employee";
}

export const Sidebar = ({ userRole }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState("/dashboard");
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path: string) => {
    setActivePath(path);
    navigate(path);
  };
  
  const navItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <Calendar size={20} />,
      label: "Projects",
      path: "/projects",
    },
    {
      icon: <ListCheck size={20} />,
      label: "Tasks",
      path: "/tasks",
    },
    ...(userRole === "founder"
      ? [
          {
            icon: <Users size={20} />,
            label: "Employees",
            path: "/employees",
          },
        ]
      : []),
    {
      icon: <MessageSquare size={20} />,
      label: "Messages",
      path: "/messages",
    },
  ];

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-[80px]" : "w-[250px]"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <h1 className={cn("text-lg font-bold text-primary transition-opacity", 
          collapsed ? "opacity-0 hidden" : "opacity-100")}>
          Officium
        </h1>
        <button
          onClick={toggleSidebar}
          className={cn("ml-auto p-2 rounded-full hover:bg-muted", collapsed && "ml-1")}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div className="mt-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={activePath === item.path}
            onClick={() => handleNavigation(item.path)}
          />
        ))}
      </div>
      
      <div className="mt-auto mb-4 px-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-6 text-base font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => navigate("/login")}
        >
          <LogOut size={20} />
          <span className={cn(collapsed ? "hidden" : "block")}>Logout</span>
        </Button>
      </div>
    </aside>
  );
};
