import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Wallet,
  Search,
  Loader2,
  TrendingUp
} from "lucide-react";

interface BudgetProject {
  id: string;
  name: string;
  description: string | null;
  region: string;
  district: string | null;
  sector: string;
  source_type: string;
  donor: string | null;
  allocated_amount: number;
  spent_amount: number;
  status: string;
  start_year: number | null;
  end_year: number | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

const SECTORS = [
  "Ta'lim",
  "Sog'liqni saqlash",
  "Yo'l infratuzilmasi",
  "Suv ta'minoti",
  "Energetika",
  "Sanoat",
  "Transport",
  "Turizm",
  "Madaniyat",
  "Qishloq xo'jaligi",
  "Ekologiya",
  "Savdo",
];

const SOURCE_TYPES = [
  { value: "Davlat byudjeti", label: "Davlat byudjeti" },
  { value: "Xorijiy grant", label: "Xorijiy grant" },
  { value: "Xorijiy kredit", label: "Xorijiy kredit" },
  { value: "Xorijiy investitsiya", label: "Xorijiy investitsiya" },
  { value: "Davlat-xususiy sheriklik", label: "Davlat-xususiy sheriklik" },
];

const STATUSES = [
  { value: "planned", label: "Rejalashtirilgan", color: "bg-gray-500" },
  { value: "in_progress", label: "Jarayonda", color: "bg-blue-500" },
  { value: "completed", label: "Tugallangan", color: "bg-green-500" },
  { value: "suspended", label: "To'xtatilgan", color: "bg-yellow-500" },
];

const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Buxoro viloyati",
  "Farg'ona viloyati",
  "Andijon viloyati",
  "Namangan viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Navoiy viloyati",
  "Jizzax viloyati",
  "Xorazm viloyati",
  "Qoraqalpog'iston",
  "Sirdaryo viloyati",
];

export default function AdminBudget() {
  const [projects, setProjects] = useState<BudgetProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<BudgetProject | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [donor, setDonor] = useState("");
  const [allocatedAmount, setAllocatedAmount] = useState("");
  const [spentAmount, setSpentAmount] = useState("");
  const [status, setStatus] = useState("planned");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("budget_projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast.error("Loyihalar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setRegion("");
    setDistrict("");
    setSector("");
    setSourceType("");
    setDonor("");
    setAllocatedAmount("");
    setSpentAmount("");
    setStatus("planned");
    setStartYear("");
    setEndYear("");
    setEditingProject(null);
  };

  const openEditModal = (project: BudgetProject) => {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description || "");
    setRegion(project.region);
    setDistrict(project.district || "");
    setSector(project.sector);
    setSourceType(project.source_type);
    setDonor(project.donor || "");
    setAllocatedAmount(project.allocated_amount.toString());
    setSpentAmount(project.spent_amount.toString());
    setStatus(project.status);
    setStartYear(project.start_year?.toString() || "");
    setEndYear(project.end_year?.toString() || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !region || !sector || !sourceType || !allocatedAmount) {
      toast.error("Barcha majburiy maydonlarni to'ldiring");
      return;
    }

    setSaving(true);
    try {
      const projectData = {
        name: name.trim(),
        description: description.trim() || null,
        region,
        district: district.trim() || null,
        sector,
        source_type: sourceType,
        donor: donor.trim() || null,
        allocated_amount: parseFloat(allocatedAmount),
        spent_amount: parseFloat(spentAmount) || 0,
        status,
        start_year: startYear ? parseInt(startYear) : null,
        end_year: endYear ? parseInt(endYear) : null,
      };

      if (editingProject) {
        const { error } = await supabase
          .from("budget_projects")
          .update(projectData)
          .eq("id", editingProject.id);
        if (error) throw error;
        toast.success("Loyiha yangilandi");
      } else {
        const { error } = await supabase.from("budget_projects").insert(projectData);
        if (error) throw error;
        toast.success("Loyiha qo'shildi");
      }

      setModalOpen(false);
      resetForm();
      fetchProjects();
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Loyihani o'chirishni tasdiqlaysizmi?")) return;

    try {
      const { error } = await supabase.from("budget_projects").delete().eq("id", id);
      if (error) throw error;
      toast.success("Loyiha o'chirildi");
      fetchProjects();
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} mlrd`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} mln`;
    }
    return amount.toLocaleString();
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAllocated = projects.reduce((sum, p) => sum + p.allocated_amount, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent_amount, 0);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Byudjet loyihalari
            </h1>
            <p className="text-muted-foreground">
              Moliyaviy loyihalarni boshqarish
            </p>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Loyiha qo'shish
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <p className="text-xs text-muted-foreground">Jami loyihalar</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatAmount(totalAllocated)}</p>
                  <p className="text-xs text-muted-foreground">Ajratilgan mablag'</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatAmount(totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">Sarflangan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loyiha nomi</TableHead>
                    <TableHead>Hudud</TableHead>
                    <TableHead>Yo'nalish</TableHead>
                    <TableHead>Manba</TableHead>
                    <TableHead>Mablag'</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loyiha topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {project.name}
                        </TableCell>
                        <TableCell>{project.region}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{project.sector}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{project.source_type}</span>
                          {project.donor && (
                            <div className="text-xs text-muted-foreground">
                              {project.donor}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatAmount(project.allocated_amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sarflangan: {formatAmount(project.spent_amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUSES.find(s => s.value === project.status)?.color}>
                            {STATUSES.find(s => s.value === project.status)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(project)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Loyihani tahrirlash" : "Yangi loyiha"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Loyiha nomi *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Loyiha nomi"
                />
              </div>

              <div className="space-y-2">
                <Label>Tavsif</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Loyiha haqida qisqacha"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hudud *</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tuman</Label>
                  <Input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Tuman nomi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Yo'nalish *</Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Moliyalashtirish manbai *</Label>
                  <Select value={sourceType} onValueChange={setSourceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_TYPES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Donor/Investor</Label>
                <Input
                  value={donor}
                  onChange={(e) => setDonor(e.target.value)}
                  placeholder="Masalan: Jahon banki"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ajratilgan mablag' (so'm) *</Label>
                  <Input
                    type="number"
                    value={allocatedAmount}
                    onChange={(e) => setAllocatedAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sarflangan mablag' (so'm)</Label>
                  <Input
                    type="number"
                    value={spentAmount}
                    onChange={(e) => setSpentAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Holat</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Boshlanish yili</Label>
                  <Input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    placeholder="2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tugash yili</Label>
                  <Input
                    type="number"
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    placeholder="2026"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingProject ? "Saqlash" : "Qo'shish"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
