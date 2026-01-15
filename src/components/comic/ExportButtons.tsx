import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, FileImage, FileText, RotateCcw, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface ExportButtonsProps {
  comicRef: React.RefObject<HTMLDivElement>;
  title: string;
  onReset: () => void;
}

export const ExportButtons = ({ comicRef, title, onReset }: ExportButtonsProps) => {
  const [isExporting, setIsExporting] = useState<"image" | "pdf" | null>(null);

  const sanitizeFilename = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  };

  const downloadAsImage = async () => {
    if (!comicRef.current) return;
    
    setIsExporting("image");
    try {
      const canvas = await html2canvas(comicRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFF8E7",
      });
      
      const link = document.createElement("a");
      link.download = `${sanitizeFilename(title)}-comic.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Comic downloaded as image!");
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error("Failed to export image. Please try again.");
    } finally {
      setIsExporting(null);
    }
  };

  const downloadAsPDF = async () => {
    if (!comicRef.current) return;
    
    setIsExporting("pdf");
    try {
      const canvas = await html2canvas(comicRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFF8E7",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${sanitizeFilename(title)}-comic.pdf`);
      
      toast.success("Comic downloaded as PDF!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="flex flex-wrap justify-center gap-4"
    >
      <Button
        onClick={downloadAsImage}
        disabled={isExporting !== null}
        className="bg-comic-blue hover:bg-comic-blue/90 text-white font-bold border-2 border-comic-text shadow-comic"
      >
        {isExporting === "image" ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileImage className="w-4 h-4 mr-2" />
        )}
        Download as Image
      </Button>

      <Button
        onClick={downloadAsPDF}
        disabled={isExporting !== null}
        className="bg-comic-red hover:bg-comic-red/90 text-white font-bold border-2 border-comic-text shadow-comic"
      >
        {isExporting === "pdf" ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 mr-2" />
        )}
        Download as PDF
      </Button>

      <Button
        onClick={onReset}
        variant="outline"
        className="font-bold border-2 border-comic-text shadow-comic"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Create Another
      </Button>
    </motion.div>
  );
};
