import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  BookOpen, 
  CreditCard, 
  Sparkles, 
  Calendar,
  Trash2,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface UserComic {
  id: string;
  title: string;
  theme: string | null;
  cover_image_url: string;
  created_at: string;
}

const MyComics = () => {
  const { isAuthenticated, loading: authLoading, profile } = useAuth();
  const navigate = useNavigate();
  const [comics, setComics] = useState<UserComic[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchComics();
    }
  }, [isAuthenticated]);

  const fetchComics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_comics")
      .select("id, title, theme, cover_image_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comics:", error);
      toast.error("Failed to load your comics");
    } else {
      setComics(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from("user_comics")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting comic:", error);
      toast.error("Failed to delete comic");
    } else {
      setComics(comics.filter((c) => c.id !== id));
      toast.success("Comic deleted");
    }
    setDeletingId(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-comic-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-comic-cream flex flex-col">
      <Navbar />

      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-comic-green/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-comic-blue/20 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10"
        >
          <div>
            <h1
              className="text-4xl md:text-5xl font-black text-comic-text mb-2"
              style={{ textShadow: "3px 3px 0 hsl(var(--comic-green))" }}
            >
              🖼️ My Comics
            </h1>
            <p className="text-muted-foreground">
              View and manage all your created comics
            </p>
          </div>

          <Link to="/">
            <Button className="bg-primary text-primary-foreground font-bold border-4 border-comic-text shadow-comic hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Create New Comic
            </Button>
          </Link>
        </motion.div>

        {/* Account Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border-4 border-comic-text rounded-2xl shadow-comic p-6 mb-10"
        >
          <h2 className="font-bold text-comic-text mb-4">Account Summary</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Plan */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
              {profile?.subscription_status === "active" ? (
                <>
                  <Sparkles className="w-8 h-8 text-comic-yellow" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="font-bold text-comic-text">Unlimited</p>
                  </div>
                </>
              ) : (
                <>
                  <CreditCard className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="font-bold text-comic-text">Credit Pack</p>
                  </div>
                </>
              )}
            </div>

            {/* Credits */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
              <div className="w-8 h-8 bg-comic-green/20 rounded-full flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {profile?.subscription_status === "active" ? "Status" : "Credits Remaining"}
                </p>
                <p className="font-bold text-comic-text">
                  {profile?.subscription_status === "active" 
                    ? "Unlimited" 
                    : `${profile?.credits ?? 0} credits`}
                </p>
              </div>
            </div>

            {/* Comics Created */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
              <div className="w-8 h-8 bg-comic-blue/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-comic-blue" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comics Created</p>
                <p className="font-bold text-comic-text">{comics.length}</p>
              </div>
            </div>
          </div>

          {profile?.subscription_status !== "active" && (profile?.credits ?? 0) < 3 && (
            <div className="mt-4 p-4 bg-comic-yellow/10 border-2 border-comic-yellow rounded-xl">
              <p className="text-sm text-comic-text">
                Running low on credits?{" "}
                <Link to="/pricing" className="font-bold text-primary hover:underline">
                  Get more credits or go unlimited →
                </Link>
              </p>
            </div>
          )}
        </motion.div>

        {/* Comics Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : comics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <div className="bg-card border-4 border-comic-text rounded-2xl shadow-comic-lg p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-comic-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-comic-blue" />
              </div>
              <h2 className="text-2xl font-black text-comic-text mb-3">
                No Comics Yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your first comic and it will appear here!
              </p>
              <Link to="/">
                <Button className="bg-primary text-primary-foreground font-bold border-4 border-comic-text shadow-comic">
                  <Plus className="w-5 h-5 mr-2" />
                  Create My First Comic
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {comics.map((comic, index) => (
              <motion.div
                key={comic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="group bg-card border-4 border-comic-text rounded-xl shadow-comic overflow-hidden hover:shadow-comic-lg transition-shadow"
              >
                {/* Cover Image */}
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={comic.cover_image_url}
                    alt={comic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-comic-text line-clamp-1 mb-1">
                    {comic.title}
                  </h3>
                  {comic.theme && (
                    <span className="inline-block px-2 py-0.5 bg-muted text-xs font-medium rounded-full text-muted-foreground mb-2">
                      {comic.theme}
                    </span>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(comic.created_at).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => handleDelete(comic.id)}
                      disabled={deletingId === comic.id}
                      className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {deletingId === comic.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyComics;
