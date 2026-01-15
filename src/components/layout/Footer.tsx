import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-comic-text text-comic-cream py-8 mt-auto"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <span className="font-bold">Comic Creator</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="hover:text-secondary transition-colors">
              Home
            </Link>
            <Link to="/gallery" className="hover:text-secondary transition-colors">
              Gallery
            </Link>
            <Link to="/pricing" className="hover:text-secondary transition-colors">
              Pricing
            </Link>
          </div>

          <p className="text-sm text-comic-cream/70">
            Made with 💥 POW 💥 and AI magic
          </p>
        </div>
      </div>
    </motion.footer>
  );
};
