import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, Shield, User } from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string | null;
  isAdmin?: boolean;
  feedbackCount?: number;
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch admin roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Fetch feedback counts per user
      const { data: feedbacksData } = await supabase
        .from("feedbacks")
        .select("user_id");

      const feedbackCounts: Record<string, number> = {};
      feedbacksData?.forEach((fb) => {
        if (fb.user_id) {
          feedbackCounts[fb.user_id] = (feedbackCounts[fb.user_id] || 0) + 1;
        }
      });

      const adminUserIds = new Set(
        rolesData?.filter((r) => r.role === "admin").map((r) => r.user_id)
      );

      const enrichedProfiles = profilesData?.map((profile) => ({
        ...profile,
        isAdmin: adminUserIds.has(profile.id),
        feedbackCount: feedbackCounts[profile.id] || 0,
      })) || [];

      setProfiles(enrichedProfiles);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery)
  );

  const stats = {
    total: profiles.length,
    admins: profiles.filter((p) => p.isAdmin).length,
    withFeedbacks: profiles.filter((p) => (p.feedbackCount || 0) > 0).length,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
          <p className="text-muted-foreground">
            Ro'yxatdan o'tgan foydalanuvchilar ro'yxati
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Jami foydalanuvchilar</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Administratorlar</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <User className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.withFeedbacks}</p>
                <p className="text-sm text-muted-foreground">Murojaat yuborgan</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ism yoki telefon bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ism</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Murojaatlar</TableHead>
                    <TableHead>Ro'yxatdan o'tgan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Yuklanmoqda...
                      </TableCell>
                    </TableRow>
                  ) : filteredProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Foydalanuvchilar topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.full_name || "Noma'lum"}
                        </TableCell>
                        <TableCell>{profile.phone || "—"}</TableCell>
                        <TableCell>
                          {profile.isAdmin ? (
                            <Badge className="bg-warning text-warning-foreground">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline">Foydalanuvchi</Badge>
                          )}
                        </TableCell>
                        <TableCell>{profile.feedbackCount}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.created_at
                            ? format(new Date(profile.created_at), "d MMM yyyy", { locale: uz })
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
