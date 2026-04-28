"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/ui/Navbar";
import { mockResources } from "@/lib/mock-data";
import { Network, ZoomIn, ZoomOut, Maximize, MousePointerClick, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Force-graph requires client-side rendering with no SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-black/5 dark:bg-white/5"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

const SUBJECT_COLORS: Record<string, string> = {
  "Computer Science": "#3b82f6", // blue
  "Physics": "#8b5cf6", // violet
  "Mathematics": "#ec4899", // pink
  "Literature": "#f59e0b", // amber
  "History": "#ef4444", // red
  "Biology": "#10b981", // emerald
};

type Node = {
  id: string;
  name: string;
  group: string;
  val: number;
  color: string;
  resourceData?: any;
};

type Link = {
  source: string;
  target: string;
};

export default function NetworkPage() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState<any>(null);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight - 80 });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight - 80 });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const graphData = useMemo(() => {
    const nodes: Node[] = [];
    const links: Link[] = [];
    const subjectNodes = new Set<string>();
    const authorNodes = new Set<string>();

    mockResources.forEach((r) => {
      // Create main Resource Node
      nodes.push({
        id: r.id,
        name: r.title,
        group: "resource",
        val: Math.max(2, r.downloads / 3000),
        color: SUBJECT_COLORS[r.subject] || "#94a3b8",
        resourceData: r
      });

      // Map unique subjects as categorical hubs
      if (!subjectNodes.has(r.subject)) {
        nodes.push({ id: `subj-${r.subject}`, name: r.subject, group: "subject", val: 8, color: "#ffffff" });
        subjectNodes.add(r.subject);
      }
      links.push({ source: r.id, target: `subj-${r.subject}` });

      // Connect difficulty
      const diffId = `diff-${r.difficulty}`;
      if (!authorNodes.has(diffId)) {
        nodes.push({ id: diffId, name: r.difficulty || "Beginner", group: "difficulty", val: 5, color: "#64748b" });
        authorNodes.add(diffId);
      }
      links.push({ source: r.id, target: diffId });
    });

    return { nodes, links };
  }, []);

  return (
    <div className="min-h-screen pt-20 flex flex-col bg-[#0f172a] text-white selection:bg-primary/30 overflow-hidden relative">
      <Navbar />

      {/* Control Overlay */}
      <div className="absolute top-28 left-8 z-10 p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 max-w-sm pointer-events-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
             <Network className="h-5 w-5" />
          </div>
          <h1 className="font-display font-black text-2xl tracking-tight leading-none text-white">Library Constellation</h1>
        </div>
        <p className="text-xs text-white/60 mb-6 font-medium leading-relaxed">
           A next-generation knowledge graph visualizing the interconnected relationships between subjects, difficulty arcs, and authors in real-time.
        </p>

        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Subject Legend</span>
           {Object.entries(SUBJECT_COLORS).map(([subject, color]) => (
             <div key={subject} className="flex items-center gap-2 text-xs font-semibold">
               <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
               <span className="text-white/80">{subject}</span>
             </div>
           ))}
        </div>
      </div>

      {hoveredNode && hoveredNode.group === "resource" && (
        <div className="absolute bottom-10 left-10 z-20 w-80 p-5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto">
          <span className="text-[10px] uppercase font-bold text-white/50">{hoveredNode.resourceData.subject}</span>
          <h3 className="font-bold text-white leading-tight mb-2">{hoveredNode.name}</h3>
          <p className="text-xs text-white/70 line-clamp-2 mb-4">{hoveredNode.resourceData.description}</p>
          <Link href={`/resource/${hoveredNode.id}`} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors text-xs font-bold text-white shadow-[0_0_15px_rgba(var(--primary),0.5)]">
             <MousePointerClick className="h-3 w-3" /> Enter Document
          </Link>
        </div>
      )}

      {/* Force Graph Renderer */}
      <div className="flex-1 w-full h-[calc(100vh-80px)] cursor-crosshair">
        {windowSize.width > 0 && (
          <ForceGraph2D
            width={windowSize.width}
            height={windowSize.height}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node: any) => node.color}
            nodeVal={(node: any) => node.val}
            linkColor={() => "rgba(255,255,255,0.15)"}
            linkWidth={1.5}
            backgroundColor="#0f172a"
            onNodeHover={(node) => setHoveredNode(node)}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.name;
              const fontSize = node.group === "subject" ? 14/globalScale : 10/globalScale;
              
              // Draw Node Circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.color;
              ctx.fill();

              // For specific high-value nodes or subjects, render labels always
              if (node.group === "subject" || globalScale > 1.5) {
                ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = node.group === "subject" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)";
                ctx.fillText(label, node.x, node.y + node.val + (4/globalScale));
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
