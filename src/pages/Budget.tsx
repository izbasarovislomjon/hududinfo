import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  TrendingUp, 
  Building2, 
  MapPin, 
  Filter,
  PieChart as PieChartIcon,
  BarChart3,
  Table as TableIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
  Legend
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const regions = [
  "Barcha viloyatlar",
  "Andijon",
  "Buxoro",
  "Farg'ona",
  "Jizzax",
  "Namangan",
  "Navoiy",
  "Qashqadaryo",
  "Qoraqalpog'iston Respublikasi",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
  "Toshkent",
  "Toshkent sh",
  "Xorazm"
];

const sectors = [
  { value: "all", label: "Barcha yo'nalishlar" },
  { value: "Ta'lim", label: "Ta'lim" },
  { value: "Sog'liq", label: "Sog'liqni saqlash" },
  { value: "Yo'l", label: "Yo'l qurilishi" },
  { value: "Suv", label: "Suv ta'minoti" }
];

const sourceTypes = [
  { value: "all", label: "Barcha manbalar" },
  { value: "BYUDJET", label: "Davlat byudjeti" },
  { value: "HOMIY", label: "Homiylar" },
  { value: "IFI", label: "Xalqaro moliya institutlari" }
];

const donors = [
  "Barcha donorlar",
  "ADB",
  "AIIB",
  "EBRD",
  "IsDB",
  "Jahon banki",
  "O'zR Davlat byudjeti",
  "UNDP",
  "UNICEF"
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

const formatAmount = (amount: number) => {
  if (amount >= 1e12) return `${(amount / 1e12).toFixed(2)} trln`;
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)} mlrd`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)} mln`;
  return amount.toLocaleString();
};

export default function Budget() {
  const [selectedRegion, setSelectedRegion] = useState("Barcha viloyatlar");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedDonor, setSelectedDonor] = useState("Barcha donorlar");

  const { data: projects, isLoading } = useQuery({
    queryKey: ['budget_projects', selectedRegion, selectedSector, selectedSource, selectedDonor],
    queryFn: async () => {
      let query = supabase.from('budget_projects').select('*');

      if (selectedRegion !== "Barcha viloyatlar") {
        query = query.eq('region', selectedRegion);
      }
      if (selectedSector !== "all") {
        query = query.eq('sector', selectedSector);
      }
      if (selectedSource !== "all") {
        query = query.eq('source_type', selectedSource);
      }
      if (selectedDonor !== "Barcha donorlar") {
        query = query.eq('donor', selectedDonor);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!projects) return { total: 0, allocated: 0, spent: 0, utilization: 0 };
    
    const allocated = projects.reduce((sum, p) => sum + (Number(p.allocated_amount) || 0), 0);
    const spent = projects.reduce((sum, p) => sum + (Number(p.spent_amount) || 0), 0);
    
    return {
      total: projects.length,
      allocated,
      spent,
      utilization: allocated > 0 ? Math.round((spent / allocated) * 100) : 0
    };
  }, [projects]);

  // Data for charts
  const sectorData = useMemo(() => {
    if (!projects) return [];
    const bySeсtor: Record<string, number> = {};
    projects.forEach(p => {
      bySeсtor[p.sector] = (bySeсtor[p.sector] || 0) + (Number(p.allocated_amount) || 0);
    });
    return Object.entries(bySeсtor).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const regionData = useMemo(() => {
    if (!projects) return [];
    const byRegion: Record<string, number> = {};
    projects.forEach(p => {
      byRegion[p.region] = (byRegion[p.region] || 0) + (Number(p.allocated_amount) || 0);
    });
    return Object.entries(byRegion)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [projects]);

  const donorData = useMemo(() => {
    if (!projects) return [];
    const byDonor: Record<string, number> = {};
    projects.forEach(p => {
      if (p.donor) {
        byDonor[p.donor] = (byDonor[p.donor] || 0) + (Number(p.allocated_amount) || 0);
      }
    });
    return Object.entries(byDonor)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [projects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'construction': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'tender': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Tugallangan';
      case 'construction': return 'Qurilishda';
      case 'tender': return 'Tender';
      default: return 'Rejalashtirilgan';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container-gov py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Byudjet shaffofligi</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Infratuzilma loyihalarining moliyalashtirish ma'lumotlari
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Viloyat" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Yo'nalish" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.value} value={sector.value}>{sector.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <Wallet className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Manba turi" />
                </SelectTrigger>
                <SelectContent>
                  {sourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDonor} onValueChange={setSelectedDonor}>
                <SelectTrigger>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Donor" />
                </SelectTrigger>
                <SelectContent>
                  {donors.map((donor) => (
                    <SelectItem key={donor} value={donor}>{donor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sarflangan</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatAmount(stats.spent)} so'm
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ajratilgan</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatAmount(stats.allocated)} so'm
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Loyihalar</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">O'zlashtirish</p>
                  <p className="text-2xl font-bold text-foreground">{stats.utilization}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <PieChartIcon className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="charts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="charts" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Grafiklar
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <TableIcon className="h-4 w-4" />
              Ma'lumotlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sectors Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Yo'nalishlar bo'yicha</CardTitle>
                </CardHeader>
                <CardContent>
                  {sectorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sectorData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatAmount(value) + " so'm"} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Ma'lumot topilmadi
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Donors Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Donorlar bo'yicha</CardTitle>
                </CardHeader>
                <CardContent>
                  {donorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={donorData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => formatAmount(v)} />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip formatter={(value: number) => formatAmount(value) + " so'm"} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Ma'lumot topilmadi
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Regions Bar Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Top 10 viloyatlar</CardTitle>
                </CardHeader>
                <CardContent>
                  {regionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={regionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis tickFormatter={(v) => formatAmount(v)} />
                        <Tooltip formatter={(value: number) => formatAmount(value) + " so'm"} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Ma'lumot topilmadi
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Loyihalar ro'yxati</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : projects && projects.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Loyiha nomi</TableHead>
                          <TableHead>Viloyat</TableHead>
                          <TableHead>Yo'nalish</TableHead>
                          <TableHead>Donor</TableHead>
                          <TableHead className="text-right">Ajratilgan</TableHead>
                          <TableHead className="text-right">Sarflangan</TableHead>
                          <TableHead>Holat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.slice(0, 50).map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium max-w-[200px] truncate">
                              {project.name}
                            </TableCell>
                            <TableCell>{project.region}</TableCell>
                            <TableCell>{project.sector}</TableCell>
                            <TableCell>{project.donor || '-'}</TableCell>
                            <TableCell className="text-right">
                              {formatAmount(Number(project.allocated_amount))}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatAmount(Number(project.spent_amount))}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(project.status)}>
                                {getStatusLabel(project.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {projects.length > 50 && (
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Jami {projects.length} ta loyihadan 50 tasi ko'rsatilmoqda
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Hozircha loyihalar mavjud emas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
