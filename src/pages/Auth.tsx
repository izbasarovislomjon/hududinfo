import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Rocket, Shield, User } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { activateAdminDemo, activateGuestDemo } = useAuth();

  useEffect(() => {
    document.title = "Demo kirish | HududInfo";
  }, []);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-xl border-primary/15 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Rocket className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Hackathon demo rejimi</CardTitle>
          <CardDescription>
            Login shart emas. Juri tez sinab ko'rishi uchun demo profillar avtomatik yaratiladi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full gap-2"
            onClick={async () => {
              await activateGuestDemo({ forceNew: true });
              navigate("/");
            }}
          >
            <User className="h-4 w-4" />
            Fuqaro demo boshlash
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={async () => {
              await activateAdminDemo();
              navigate("/admin");
            }}
          >
            <Shield className="h-4 w-4" />
            Admin demo ochish
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
