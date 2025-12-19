import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type IssueType = Database["public"]["Enums"]["issue_type"];
type ObjectType = Database["public"]["Enums"]["object_type"];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
  "hsl(var(--info))",
  "hsl(210 50% 50%)",
];

const issueTypeLabels: Record<IssueType, string> = {
  water_supply: "Suv ta'minoti",
  road_condition: "Yo'l holati",
  heating: "Isitish",
  medical_quality: "Tibbiy xizmat",
  staff_shortage: "Xodim yetishmasligi",
  infrastructure: "Infratuzilma",
  other: "Boshqa",
};

const objectTypeLabels: Record<ObjectType, string> = {
  school: "Maktab",
  kindergarten: "Bog'cha",
  clinic: "Poliklinika",
  water: "Suv ta'minoti",
  road: "Yo'l",
};

export default function AdminStatistics() {
  const [loading, setLoading] = useState(true);
  const [feedbacksByType, setFeedbacksByType] = useState<{ name: string; value: number }[]>([]);
  const [feedbacksByDistrict, setFeedbacksByDistrict] = useState<{ name: string; value: number }[]>([]);
  const [objectsByType, setObjectsByType] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch feedbacks
      const { data: feedbacks } = await supabase
        .from("feedbacks")
        .select("issue_type, object_id");

      // Fetch objects
      const { data: objects } = await supabase
        .from("infrastructure_objects")
        .select("type, district");

      // Process feedbacks by type
      const typeCount: Record<string, number> = {};
      feedbacks?.forEach((fb) => {
        typeCount[fb.issue_type] = (typeCount[fb.issue_type] || 0) + 1;
      });
      setFeedbacksByType(
        Object.entries(typeCount).map(([type, value]) => ({
          name: issueTypeLabels[type as IssueType] || type,
          value,
        }))
      );

      // Process objects by type
      const objectTypeCount: Record<string, number> = {};
      objects?.forEach((obj) => {
        objectTypeCount[obj.type] = (objectTypeCount[obj.type] || 0) + 1;
      });
      setObjectsByType(
        Object.entries(objectTypeCount).map(([type, value]) => ({
          name: objectTypeLabels[type as ObjectType] || type,
          value,
        }))
      );

      // Process by district
      const districtCount: Record<string, number> = {};
      objects?.forEach((obj) => {
        districtCount[obj.district] = (districtCount[obj.district] || 0) + 1;
      });
      setFeedbacksByDistrict(
        Object.entries(districtCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)
      );
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center h-full">
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Statistika</h1>
          <p className="text-muted-foreground">Tizim ko'rsatkichlari va tahlili</p>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Feedbacks by Type - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="h-4 w-4 text-primary" />
                Murojaatlar muammo turi bo'yicha
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacksByType.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feedbacksByType}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {feedbacksByType.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Ma'lumot yo'q
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objects by Type - Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                Obyektlar turi bo'yicha
              </CardTitle>
            </CardHeader>
            <CardContent>
              {objectsByType.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={objectsByType} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Ma'lumot yo'q
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objects by District - Bar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Tumanlar bo'yicha obyektlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbacksByDistrict.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feedbacksByDistrict}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Ma'lumot yo'q
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
