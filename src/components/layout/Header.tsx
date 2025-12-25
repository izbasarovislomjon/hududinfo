import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Menu, 
  MessageSquarePlus, 
  BarChart3,
  LogIn,
  LogOut,
  User,
  FileText,
  Shield,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.jpg";

const navItems = [
  { href: "/", label: "Asosiy", icon: Home },
  { href: "/feedbacks", label: "Murojaatlar", icon: MessageSquarePlus },
  { href: "/priority", label: "Ustuvorlik", icon: Trophy },
  { href: "/statistics", label: "Statistika", icon: BarChart3 },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container-gov flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <a href={logo} target="_blank" rel="noopener noreferrer" draggable="false">
            <img 
              src={logo} 
              alt="HududInfo.uz" 
              className="h-14 w-auto cursor-pointer"
              draggable="true"
            />
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profil</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profilim
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-feedbacks')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Mening murojaatlarim
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/admin/login" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Kirish</span>
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src={logo} 
                    alt="HududInfo.uz" 
                    className="h-14 w-auto"
                    draggable="true"
                  />
                </div>
                
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.href} 
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start gap-3"
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <>
                      <Link to="/my-feedbacks" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-3 mb-2">
                          <FileText className="h-5 w-5" />
                          Mening murojaatlarim
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full justify-start gap-3 mb-2">
                            <Shield className="h-5 w-5" />
                            Admin panel
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3"
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        Chiqish
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/admin/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-3 mb-2">
                          <Shield className="h-5 w-5" />
                          Admin panel
                        </Button>
                      </Link>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-start gap-3">
                          <LogIn className="h-5 w-5" />
                          Kirish
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
