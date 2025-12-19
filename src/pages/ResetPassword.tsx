import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { KeyRound, Loader2, Lock } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const passwordSchema = z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak");

export default function ResetPassword() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    document.title = 'Parolni tiklash | HududInfo.uz';

    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', "HududInfo.uz uchun parolni tiklash sahifasi. Emaildagi tiklash havolasi orqali yangi parol o'rnating.");
    }
  }, []);

  const canSubmit = useMemo(() => {
    return !!user && !loading && !isSaving;
  }, [user, loading, isSaving]);

  const validate = () => {
    const next: { password?: string; confirmPassword?: string } = {};

    const pass = password.trim();
    const conf = confirmPassword.trim();

    const parsed = passwordSchema.safeParse(pass);
    if (!parsed.success) {
      next.password = parsed.error.errors[0]?.message ?? "Parol noto'g'ri";
    }

    if (conf !== pass) {
      next.confirmPassword = 'Parollar mos kelmadi';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password: password.trim() });
    setIsSaving(false);

    if (error) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Muvaffaqiyatli',
      description: "Parol yangilandi",
    });

    navigate(isAdmin ? '/admin' : '/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <KeyRound className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Parolni tiklash</CardTitle>
            <CardDescription>Yuklanmoqda...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <KeyRound className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Parolni tiklash</CardTitle>
            <CardDescription>
              Emaildagi tiklash havolasini oching. Agar havola yo'q bo'lsa, qayta yuboring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={() => navigate('/admin/login')}>
              Admin login sahifasi
            </Button>
            <Button className="w-full" variant="outline" onClick={() => navigate('/auth')}>
              Fuqaro kirish sahifasi
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <KeyRound className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Yangi parol o'rnatish</CardTitle>
          <CardDescription>Yangi parol kiriting va saqlang</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Yangi parol</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Kamida 6 ta belgi"
                  autoComplete="new-password"
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Yangi parolni tasdiqlang</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Yana bir marta kiriting"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Saqlash
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
