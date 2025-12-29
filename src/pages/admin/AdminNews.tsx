import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Newspaper,
  Search,
  Loader2 
} from "lucide-react";
import { format } from "date-fns";

interface News {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  region: string | null;
  district: string | null;
  image_url: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

const CATEGORIES = [
  { value: "general", label: "Umumiy" },
  { value: "infrastructure", label: "Infratuzilma" },
  { value: "education", label: "Ta'lim" },
  { value: "healthcare", label: "Sog'liqni saqlash" },
  { value: "transport", label: "Transport" },
  { value: "water", label: "Suv ta'minoti" },
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

export default function AdminNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("general");
  const [region, setRegion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error: any) {
      console.error("Error fetching news:", error);
      toast.error("Yangiliklar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSummary("");
    setCategory("general");
    setRegion("");
    setImageUrl("");
    setIsPublished(true);
    setEditingNews(null);
  };

  const openEditModal = (item: News) => {
    setEditingNews(item);
    setTitle(item.title);
    setContent(item.content);
    setSummary(item.summary || "");
    setCategory(item.category);
    setRegion(item.region || "");
    setImageUrl(item.image_url || "");
    setIsPublished(item.is_published);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Sarlavha va matn kiritilishi shart");
      return;
    }

    setSaving(true);
    try {
      const newsData = {
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim() || null,
        category,
        region: region || null,
        image_url: imageUrl.trim() || null,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
      };

      if (editingNews) {
        const { error } = await supabase
          .from("news")
          .update(newsData)
          .eq("id", editingNews.id);
        if (error) throw error;
        toast.success("Yangilik yangilandi");
      } else {
        const { error } = await supabase.from("news").insert(newsData);
        if (error) throw error;
        toast.success("Yangilik qo'shildi");
      }

      setModalOpen(false);
      resetForm();
      fetchNews();
    } catch (error: any) {
      console.error("Error saving news:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yangilikni o'chirishni tasdiqlaysizmi?")) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
      toast.success("Yangilik o'chirildi");
      fetchNews();
    } catch (error: any) {
      console.error("Error deleting news:", error);
      toast.error("Xatolik yuz berdi");
    }
  };

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              Yangiliklar
            </h1>
            <p className="text-muted-foreground">
              Yangiliklar va e'lonlarni boshqarish
            </p>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Yangilik qo'shish
          </Button>
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
                    <TableHead>Sarlavha</TableHead>
                    <TableHead>Kategoriya</TableHead>
                    <TableHead>Hudud</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Yangilik topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNews.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.region || "—"}</TableCell>
                        <TableCell>
                          {item.is_published ? (
                            <Badge className="bg-green-500">Faol</Badge>
                          ) : (
                            <Badge variant="secondary">Qoralama</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(item.created_at), "dd.MM.yyyy")}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
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
                {editingNews ? "Yangilikni tahrirlash" : "Yangi yangilik"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sarlavha *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Yangilik sarlavhasi"
                />
              </div>

              <div className="space-y-2">
                <Label>Qisqa tavsif</Label>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Qisqa tavsif (ixtiyoriy)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Matn *</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Yangilik matni"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategoriya</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hudud</Label>
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
              </div>

              <div className="space-y-2">
                <Label>Rasm URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <Label>Faol holat</Label>
                  <p className="text-sm text-muted-foreground">
                    Yangilik saytda ko'rinsinmi?
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingNews ? "Saqlash" : "Qo'shish"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
