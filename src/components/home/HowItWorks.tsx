import { motion } from "framer-motion";
import { Lightbulb, Wand2, ImageIcon, Download } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    title: "Choose Your Theme",
    description: "Pick a style that matches your story - funny, action, romantic, or more!",
    color: "comic-yellow",
  },
  {
    icon: Wand2,
    title: "Describe Your Story",
    description: "Tell us what happens in a few sentences. The wilder, the better!",
    color: "comic-blue",
  },
  {
    icon: ImageIcon,
    title: "AI Creates Magic",
    description: "Our AI generates a cover page and 9 unique comic panels just for you.",
    color: "comic-red",
  },
  {
    icon: Download,
    title: "Download & Share",
    description: "Get your comic as a high-quality PNG or PDF to share anywhere!",
    color: "comic-green",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-12"
      >
        <h2
          className="text-3xl md:text-4xl font-black text-comic-text mb-3"
          style={{ textShadow: "2px 2px 0 hsl(var(--comic-blue))" }}
        >
          ✨ How It Works
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Creating your own comic is as easy as 1-2-3-4!
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="relative bg-card border-4 border-comic-text rounded-xl shadow-comic p-6 text-center"
          >
            {/* Step number */}
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-comic-text text-card rounded-full flex items-center justify-center font-black text-lg border-4 border-card">
              {index + 1}
            </div>

            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `hsl(var(--${step.color}) / 0.2)` }}
            >
              <step.icon
                className="w-8 h-8"
                style={{ color: `hsl(var(--${step.color}))` }}
              />
            </div>

            <h3 className="font-bold text-comic-text mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
