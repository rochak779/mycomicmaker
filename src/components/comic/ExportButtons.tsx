import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, FileImage, FileText, RotateCcw, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface Panel {
  panelNumber: number;
  visualDescription: string;
  dialogue: string;
  soundEffect?: string | null;
  imageUrl: string;
}

interface ExportButtonsProps {
  comicRef: React.RefObject<HTMLDivElement>;
  title: string;
  coverImageUrl: string;
  panels: Panel[];
  onReset: () => void;
}

export const ExportButtons = ({ comicRef, title, coverImageUrl, panels, onReset }: ExportButtonsProps) => {
  const [isExporting, setIsExporting] = useState<"image" | "pdf" | null>(null);

  const sanitizeFilename = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  };

  const createTitlePageCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d")!;
    
    // Background
    ctx.fillStyle = "#FFF8E7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw cover image if available
    if (coverImageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = coverImageUrl;
        });
        
        const imgWidth = 500;
        const imgHeight = 600;
        const imgX = (canvas.width - imgWidth) / 2;
        const imgY = 80;
        
        // Draw border
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(imgX - 4, imgY - 4, imgWidth + 8, imgHeight + 8);
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
      } catch (e) {
        console.error("Failed to load cover image:", e);
      }
    }
    
    // Draw title
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 48px Comic Sans MS, sans-serif";
    ctx.textAlign = "center";
    
    // Word wrap title
    const words = title.split(" ");
    let lines: string[] = [];
    let currentLine = "";
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 700) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    const startY = coverImageUrl ? 750 : 450;
    lines.forEach((line, i) => {
      ctx.fillText(line.toUpperCase(), canvas.width / 2, startY + i * 55);
    });
    
    return canvas;
  };

  const createComicPageCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    const panelWidth = 250;
    const panelHeight = 320;
    const gap = 15;
    const padding = 40;
    
    canvas.width = padding * 2 + panelWidth * 3 + gap * 2;
    canvas.height = padding * 2 + panelHeight * 3 + gap * 2 + 60;
    
    const ctx = canvas.getContext("2d")!;
    
    // Background with dots
    ctx.fillStyle = "#FFF8E7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 28px Comic Sans MS, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title.toUpperCase(), canvas.width / 2, 35);
    
    // Draw panels
    for (let i = 0; i < 9; i++) {
      const panel = panels[i];
      if (!panel) continue;
      
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = padding + col * (panelWidth + gap);
      const y = 60 + row * (panelHeight + gap);
      
      // Panel border
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(x - 3, y - 3, panelWidth + 6, panelHeight + 6);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, panelWidth, panelHeight);
      
      // Panel image
      if (panel.imageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = panel.imageUrl;
          });
          ctx.drawImage(img, x, y, panelWidth, panelWidth * 0.7);
        } catch (e) {
          console.error(`Failed to load panel ${i + 1} image:`, e);
        }
      }
      
      // Panel number
      ctx.fillStyle = "#FFD93D";
      ctx.beginPath();
      ctx.arc(x + 15, y + 15, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1), x + 15, y + 19);
      
      // Dialogue
      const dialogueY = y + panelWidth * 0.7 + 10;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 5, dialogueY, panelWidth - 10, panelHeight - panelWidth * 0.7 - 15);
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 5, dialogueY, panelWidth - 10, panelHeight - panelWidth * 0.7 - 15);
      
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      
      // Word wrap dialogue
      const maxWidth = panelWidth - 20;
      const words = panel.dialogue.split(" ");
      let line = "";
      let lineY = dialogueY + 15;
      
      words.forEach(word => {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth) {
          ctx.fillText(line, x + 10, lineY);
          line = word;
          lineY += 13;
        } else {
          line = testLine;
        }
      });
      if (line) ctx.fillText(line, x + 10, lineY);
    }
    
    return canvas;
  };

  const downloadAsImage = async () => {
    setIsExporting("image");
    try {
      const titleCanvas = await createTitlePageCanvas();
      const comicCanvas = await createComicPageCanvas();
      
      // Combine into one tall image
      const combined = document.createElement("canvas");
      combined.width = Math.max(titleCanvas.width, comicCanvas.width);
      combined.height = titleCanvas.height + comicCanvas.height + 20;
      
      const ctx = combined.getContext("2d")!;
      ctx.fillStyle = "#FFF8E7";
      ctx.fillRect(0, 0, combined.width, combined.height);
      ctx.drawImage(titleCanvas, (combined.width - titleCanvas.width) / 2, 0);
      ctx.drawImage(comicCanvas, (combined.width - comicCanvas.width) / 2, titleCanvas.height + 20);
      
      const link = document.createElement("a");
      link.download = `${sanitizeFilename(title)}-comic.png`;
      link.href = combined.toDataURL("image/png");
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
    setIsExporting("pdf");
    try {
      const titleCanvas = await createTitlePageCanvas();
      const comicCanvas = await createComicPageCanvas();
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [titleCanvas.width, titleCanvas.height],
      });
      
      // Page 1: Title
      pdf.addImage(titleCanvas.toDataURL("image/png"), "PNG", 0, 0, titleCanvas.width, titleCanvas.height);
      
      // Page 2: Comic
      pdf.addPage([comicCanvas.width, comicCanvas.height]);
      pdf.addImage(comicCanvas.toDataURL("image/png"), "PNG", 0, 0, comicCanvas.width, comicCanvas.height);
      
      pdf.save(`${sanitizeFilename(title)}-comic.pdf`);
      
      toast.success("Comic downloaded as 2-page PDF!");
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
