import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, activateAdminDemo } = useAuth();
  const navigate = useNavigate();

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold mb-2">Admin kirishi talab qilinadi</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Boshqaruv paneli faqat admin hisob orqali ishlaydi.
          </p>
          <Button
            onClick={async () => {
              await activateAdminDemo();
              navigate("/admin");
            }}
          >
            Admin demo ochish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
