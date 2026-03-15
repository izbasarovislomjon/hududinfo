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
import { useAuth } from "@/hooks/useAuth";
import { deleteLocalNews, listLocalNews, saveLocalNews, subscribeToLocalBackend, type LocalNewsRecord } from "@/lib/local-backend";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Newspaper, Search, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "general", label: "Umumiy" },
  { value: "infrastructure", label: "Infratuzilma" },
  { value: "education", label: "Ta'lim" },
  { value: "health", label: "Sog'liqni saqlash" },
  { value: "road", label: "Yo'l" },
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
  "Qoraqolpog'iston Respublikasi",
  "Sirdaryo viloyati",
];

export default function AdminNews() {
  const { user } = useAuth();
  const [news, setNews] = useState<LocalNewsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<LocalNewsRecord | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("general");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    const data = await listLocalNews();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchNews();
    const unsubscribe = subscribeToLocalBackend(() => {
      void fetchNews();
    });
    return unsubscribe;
  }, []);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSummary("");
    setCategory("general");
    setRegion("");
    setDistrict("");
    setImageUrl("");
    setVideoUrl("");
    setIsPublished(true);
    setEditingNews(null);
  };

  const openEditModal = (item: LocalNewsRecord) => {
    setEditingNews(item);
    setTitle(item.title);
    setContent(item.content);
    setSummary(item.summary || "");
    setCategory(item.category);
    setRegion(item.region || "");
    setDistrict(item.district || "");
    setImageUrl(item.imageUrl || "");
    setVideoUrl(item.videoUrl || "");
    setIsPublished(item.isPublished);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user || !title.trim() || !content.trim()) {
      toast.error("Sarlavha va matn kiritilishi shart");
      return;
    }

    await saveLocalNews({
      id: editingNews?.id,
      title,
      content,
      summary,
      category,
      region,
      district,
      imageUrl,
      videoUrl,
      isPublished,
      authorId: user.id,
    });
    toast.success(editingNews ? "Yangilik yangilandi" : "Yangilik qo'shildi");
    resetForm();
    setModalOpen(false);
  };

  const handleDelete = async (newsId: string) => {
    await deleteLocalNews(newsId);
    toast.success("Yangilik o'chirildi");
  };

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Yangiliklar boshqaruvi</h1>
            <p className="text-muted-foreground">Yangiliklar localhost ichida dinamik saqlanadi.</p>
          </div>
          <Button onClick={() => { resetForm(); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Yangi yangilik
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Yangilik qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sarlavha</TableHead>
                    <TableHead>Kategoriya</TableHead>
                    <TableHead>Hudud</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">Yuklanmoqda...</TableCell></TableRow>
                  ) : filteredNews.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">Yangiliklar topilmadi</TableCell></TableRow>
                  ) : (
                    filteredNews.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-[260px]"><p className="truncate font-medium text-sm">{item.title}</p></TableCell>
                        <TableCell><Badge variant="outline">{CATEGORIES.find((entry) => entry.value === item.category)?.label || item.category}</Badge></TableCell>
                        <TableCell>{item.region || "—"}</TableCell>
                        <TableCell>{format(new Date(item.publishedAt), "dd.MM.yyyy")}</TableCell>
                        <TableCell><Badge variant={item.isPublished ? "default" : "secondary"}>{item.isPublished ? "Chop etilgan" : "Qoralama"}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}><Pencil className="h-4 w-4 mr-1" />Tahrirlash</Button>
                          <Button variant="ghost" size="sm" onClick={() => void handleDelete(item.id)}><Trash2 className="h-4 w-4 mr-1" />O'chirish</Button>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingNews ? "Yangilikni tahrirlash" : "Yangi yangilik"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sarlavha</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Yangilik sarlavhasi" />
            </div>
            <div className="space-y-2">
              <Label>Qisqacha izoh</Label>
              <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Bir jumlalik izoh" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategoriya</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Kategoriya" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Viloyat</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger><SelectValue placeholder="Viloyat" /></SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tuman / shahar</Label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Masalan: Chilonzor tumani" />
            </div>
            <div className="space-y-2">
              <Label>Matn</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Yangilik matni" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Rasm URL</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Newspaper className="h-4 w-4" /> Video URL</Label>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="font-medium text-sm">Darhol chop etish</p>
                <p className="text-xs text-muted-foreground">Faol bo'lsa foydalanuvchilar news sahifasida ko'radi</p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
              <Button onClick={() => void handleSave()}>{editingNews ? "Saqlash" : "Yaratish"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
