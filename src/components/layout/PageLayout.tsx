
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useUserStore } from "@/store/userStore";

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const { currentUser } = useUserStore();
  const userRole = currentUser?.role === "founder" ? "founder" : "employee";
  
  return (
    <div className="flex h-screen w-full">
      <Sidebar userRole={userRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
