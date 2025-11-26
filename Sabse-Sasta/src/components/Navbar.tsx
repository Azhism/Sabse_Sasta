import { ShoppingCart, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

export const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTotalItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemsCount = getTotalItems();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You've been logged out successfully.",
    });
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">₨</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Sabse Sasta
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              How it Works
            </a>
            <a href="#vendors" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Vendors
            </a>
            <a href="#features" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Features
            </a>
            <Button variant="ghost" onClick={() => navigate("/shopping-lists")}>
              Shopping Lists
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/cart")}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
            {isAuthenticated && user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <Button variant="hero" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-3">
              <a href="#how-it-works" className="px-3 py-2 text-foreground/80 hover:text-primary hover:bg-accent rounded-lg transition-colors">
                How it Works
              </a>
              <a href="#vendors" className="px-3 py-2 text-foreground/80 hover:text-primary hover:bg-accent rounded-lg transition-colors">
                Vendors
              </a>
              <a href="#features" className="px-3 py-2 text-foreground/80 hover:text-primary hover:bg-accent rounded-lg transition-colors">
                Features
              </a>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/shopping-lists")}>
                Shopping Lists
              </Button>
              {isAuthenticated && user ? (
                <>
                  <Button variant="ghost" className="w-full mt-2" onClick={() => navigate("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/auth")}>
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button variant="hero" className="flex-1" onClick={() => navigate("/auth")}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
