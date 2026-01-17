import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Menu, X, Sparkles, CreditCard } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const { isAuthenticated, profile, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Gallery" },
    { href: "/pricing", label: "Pricing" },
  ];

  const isActiveLink = (href: string) => location.pathname === href;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b-4 border-comic-text shadow-comic"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <span
              className="text-xl font-black text-comic-text hidden sm:block"
              style={{ textShadow: "2px 2px 0 hsl(var(--comic-yellow))" }}
            >
              Your Comic Maker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-bold text-sm uppercase tracking-wide transition-colors ${
                  isActiveLink(link.href) ? "text-primary" : "text-comic-text hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-8 bg-muted animate-pulse rounded" />
            ) : isAuthenticated ? (
              <>
                {/* Credits Display */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/20 rounded-full border-2 border-comic-text">
                  {profile?.subscription_status === "active" ? (
                    <>
                      <Sparkles className="h-4 w-4 text-comic-yellow" />
                      <span className="text-sm font-bold text-comic-text">Unlimited</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-comic-text">{profile?.credits ?? 0} credits</span>
                    </>
                  )}
                </div>

                <Link to="/my-comics">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-comic-text font-bold hover:bg-primary hover:text-primary-foreground"
                  >
                    My Comics
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="border-2 border-comic-text font-bold">
                    Login
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground font-bold border-2 border-comic-text shadow-comic hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6 text-comic-text" /> : <Menu className="h-6 w-6 text-comic-text" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t-2 border-comic-text/20"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-bold text-sm uppercase tracking-wide py-2 ${
                    isActiveLink(link.href) ? "text-primary" : "text-comic-text"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 py-2">
                    {profile?.subscription_status === "active" ? (
                      <>
                        <Sparkles className="h-4 w-4 text-comic-yellow" />
                        <span className="text-sm font-bold">Unlimited</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold">{profile?.credits ?? 0} credits</span>
                      </>
                    )}
                  </div>
                  <Link
                    to="/my-comics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-bold text-sm uppercase tracking-wide py-2 text-comic-text"
                  >
                    My Comics
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="font-bold text-sm uppercase tracking-wide py-2 text-destructive text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button variant="outline" className="w-full border-2 border-comic-text font-bold">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                    <Button className="w-full bg-primary font-bold border-2 border-comic-text">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
