import { Resource } from "@/lib/mock-data";
import { Download, Star, ExternalLink, BookOpen, FileText, Video, AlignLeft, GraduationCap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useRef } from "react";

const typeIconMap: Record<string, React.ReactNode> = {
  "Textbook": <BookOpen className="w-4 h-4" />,
  "Research Paper": <FileText className="w-4 h-4" />,
  "Study Guide": <GraduationCap className="w-4 h-4" />,
  "Notes": <AlignLeft className="w-4 h-4" />,
  "Video Lecture": <Video className="w-4 h-4" />,
};

interface Props {
  resource: Resource;
  className?: string;
  onDownload?: (id: string) => void;
}

export function ResourceCard({ resource, className, onDownload }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const getCoverColor = (title: string) => {
    const colors = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"];
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate cursor position relative to the center
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize to -1 to 1 space
    const xPct = (mouseX / width - 0.5) * 2;
    const yPct = (mouseY / height - 0.5) * 2;

    // Apply max 12 degree perspective tilt
    const rotateX = yPct * -12; 
    const rotateY = xPct * 12;

    setRotate({ x: rotateX, y: rotateY });
    
    // Dynamic glare maps opposite to mouse position
    setGlarePosition({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Reset to neutral
    setRotate({ x: 0, y: 0 });
    setGlarePosition({ x: 50, y: 50 });
  };

  return (
    <div 
      ref={cardRef}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/80",
        // Base transition only applies tracking resets softly, we apply transforms directly via style
        "transition-[box-shadow_opacity] duration-300 md:hover:shadow-2xl md:dark:hover:bg-black/90",
        "transform-gpu style-preserve-3d", // Tailwind V4 hardware hints
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
        transition: isHovered ? 'transform 0.1s cubic-bezier(0.2, 0, 0, 1)' : 'transform 0.5s ease-out'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic Overlay Glare Element */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl mix-blend-overlay z-50 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.7 : 0,
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%)`
        }}
      />
      
      {/* 3D Depth Shadows */}
      <div 
        className="absolute -inset-1 -z-10 rounded-2xl bg-black/20 dark:bg-black/50 blur-xl transition-all duration-300 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: `translate(${rotate.y * -1}px, ${rotate.x * 1}px)`,
        }}
      />
      
      {/* Inner Wrap - Enforces clipping visually under the 3D container without breaking 3d bounds */}
      <div className="relative h-full w-full rounded-2xl overflow-hidden flex flex-col justify-between">
        <Link href={`/resource/${resource.id}`} className="flex flex-col flex-grow">
        <div className="relative h-48 w-full overflow-hidden bg-muted border-b border-black/5 dark:border-white/5 shrink-0">
        {resource.thumbnail ? (
          <img 
            src={resource.thumbnail} 
            alt={resource.title} 
            className="h-full w-full object-cover transition-transform duration-700 ease-out py-0 md:py-4 px-0 md:px-8 group-hover:scale-105"
          />
        ) : (
          <div className={cn("absolute inset-0 flex items-center justify-center", getCoverColor(resource.title))}>
            <div className="px-6 py-8 text-center bg-black/20 w-full h-full backdrop-blur-sm flex items-center justify-center">
              <span className="font-display font-bold text-white text-xl line-clamp-3 leading-snug drop-shadow-md">
                {resource.title}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-foreground select-none">
            {typeIconMap[resource.resource_type]}
            {resource.resource_type}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            {resource.author}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
            <span className="text-sm font-bold">{resource.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      </Link>

      {/* Footer Actions */}
      <div className="mt-auto flex items-center justify-between p-5 pt-0 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 backdrop-blur-md relative z-10 transition-colors group-hover:bg-transparent">
        <Link 
          href={`/resource/${resource.id}`}
          className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Chat with PDF
        </Link>
        <button 
          onClick={(e) => {
             e.preventDefault();
             onDownload?.(resource.id);
          }}
          className={cn(
            "flex items-center gap-2 rounded-full bg-primary hover:bg-primary/90 px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:scale-105 active:scale-95",
            className?.includes("bg-accent") ? "bg-accent hover:bg-accent/90" : ""
          )}
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Gamification Progress Bar */}
      {resource.progress !== undefined && (
        <div className="h-1 w-full bg-black/10 dark:bg-white/10 absolute bottom-0 left-0 z-20">
          <div 
            className={cn(
              "h-full transition-all duration-1000",
              resource.progress === 100 ? "bg-emerald-500" : "bg-primary"
            )}
            style={{ width: `${resource.progress}%` }}
          />
        </div>
      )}
      
      {/* Subtle Glow Effect */}
      <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      </div> {/* Close Inner Wrap */}
    </div>
  );
}
