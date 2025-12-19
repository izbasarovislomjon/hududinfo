import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, School, Building, Stethoscope, Droplets, Navigation, Star } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ObjectType = Database["public"]["Enums"]["object_type"];

interface InfrastructureObject {
  id: string;
  name: string;
  type: ObjectType;
  address: string;
  district: string;
  region: string;
  rating: number | null;
  total_feedbacks: number | null;
  capacity: number | null;
  built_year: number | null;
}

const typeLabels: Record<ObjectType, string> = {
  school: "Maktab",
  kindergarten: "Bog'cha",
  clinic: "Poliklinika",
  water: "Suv ta'minoti",
  road: "Yo'l",
};

const typeIcons: Record<ObjectType, React.ElementType> = {
  school: School,
  kindergarten: Building,
  clinic: Stethoscope,
  water: Droplets,
  road: Navigation,
};

const typeColors: Record<ObjectType, string> = {
  school: "bg-blue-100 text-blue-700",
  kindergarten: "bg-purple-100 text-purple-700",
  clinic: "bg-red-100 text-red-700",
  water: "bg-cyan-100 text-cyan-700",
  road: "bg-amber-100 text-amber-700",
};

export default function AdminObjects() {
  const [objects, setObjects] = useState<InfrastructureObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ObjectType | "all">("all");

  useEffect(() => {
    fetchObjects();
  }, [typeFilter]);

  const fetchObjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("infrastructure_objects")
        .select("*")
        .order("name");

      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setObjects(data || []);
    } catch (error) {
      console.error("Error fetching objects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredObjects = objects.filter(
    (obj) =>
      obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const typeCounts = {
    all: objects.length,
    school: objects.filter((o) => o.type === "school").length,
    kindergarten: objects.filter((o) => o.type === "kindergarten").length,
    clinic: objects.filter((o) => o.type === "clinic").length,
    water: objects.filter((o) => o.type === "water").length,
    road: objects.filter((o) => o.type === "road").length,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Infratuzilma obyektlari</h1>
          <p className="text-muted-foreground">
            Maktablar, bog'chalar, poliklinikalar va boshqalar
          </p>
        </div>

        {/* Type Stats */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {(["all", "school", "kindergarten", "clinic", "water", "road"] as const).map((type) => {
            const Icon = type === "all" ? School : typeIcons[type];
            return (
              <Card
                key={type}
                className={`cursor-pointer transition-all ${
                  typeFilter === type ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setTypeFilter(type)}
              >
                <CardContent className="p-3 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-bold text-lg">{typeCounts[type]}</p>
                    <p className="text-xs text-muted-foreground">
                      {type === "all" ? "Barchasi" : typeLabels[type]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nom, manzil yoki tuman bo'yicha qidirish..."
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
                    <TableHead>Nomi</TableHead>
                    <TableHead>Turi</TableHead>
                    <TableHead>Tuman</TableHead>
                    <TableHead>Manzil</TableHead>
                    <TableHead>Reyting</TableHead>
                    <TableHead>Murojaatlar</TableHead>
                    <TableHead>Sig'imi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Yuklanmoqda...
                      </TableCell>
                    </TableRow>
                  ) : filteredObjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Obyektlar topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredObjects.map((obj) => {
                      const TypeIcon = typeIcons[obj.type];
                      return (
                        <TableRow key={obj.id}>
                          <TableCell className="font-medium max-w-[250px]">
                            <p className="truncate">{obj.name}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={typeColors[obj.type]}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {typeLabels[obj.type]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{obj.district}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                            <p className="truncate">{obj.address}</p>
                          </TableCell>
                          <TableCell>
                            {obj.rating ? (
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-warning fill-warning" />
                                {obj.rating.toFixed(1)}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>{obj.total_feedbacks || 0}</TableCell>
                          <TableCell>{obj.capacity || "—"}</TableCell>
                        </TableRow>
                      );
                    })
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
