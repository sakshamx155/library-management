"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, FileText, Bot, User, BookOpen, Clock, Star, Download, Loader2, Trophy, X, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { mockResources, Resource } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const resource = mockResources.find((r) => r.id === unwrappedParams.id);

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hello! I am your AI assistant. I've read this entire document. What would you like to know?" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Gamification & Recommendation State
  const [showBadge, setShowBadge] = useState(false);
  const [escalationSuggestion, setEscalationSuggestion] = useState<Resource | null>(null);

  // Next-Gen Feature State
  const [activeTab, setActiveTab] = useState<"chat" | "flashcards">("chat");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);

  useEffect(() => {
    // Simulate automated badge heuristic evaluation based on RAG usage
    const timer1 = setTimeout(() => {
      setShowBadge(true);
    }, 4000);

    // Difficulty Escalation Heuristic!
    let timer2: NodeJS.Timeout;
    if (resource?.difficulty === "Beginner") {
       timer2 = setTimeout(() => {
          const nextStep = mockResources.find(r => r.subject === resource.subject && r.difficulty === "Intermediate" && r.id !== resource.id) 
            || mockResources.find(r => r.difficulty === "Intermediate" && r.id !== resource.id);
          if (nextStep) {
             setEscalationSuggestion(nextStep);
          }
       }, 6000);
    }

    return () => {
      clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
    };
  }, [resource]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!resource) {
    return <div className="p-20 text-center">Resource not found.</div>;
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userQuery = query.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuery, resourceId: resource.id, context: resource }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: "Sorry, my RAG pipeline hit an error." }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "ai", content: "Network error communicating with AI server." }]);
    }

    setIsTyping(false);
  };

  const getCoverColor = (title: string) => {
    const colors = ["from-blue-500", "from-emerald-500", "from-violet-500", "from-amber-500", "from-rose-500"];
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const dynamicBgClass = 
    resource.subject === "Biology" ? "bg-emerald-950/10 dark:bg-emerald-900/10" :
    resource.subject === "Physics" || resource.subject === "Computer Science" ? "bg-blue-950/20 dark:bg-blue-900/10" :
    resource.subject === "Mathematics" ? "bg-rose-950/10 dark:bg-rose-900/10" :
    "bg-background";

  return (
    <div className={cn("min-h-screen pt-20 flex flex-col selection:bg-primary/30 transition-colors duration-1000", dynamicBgClass)}>
      <Navbar />

      <main className="flex-grow flex h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Column: Resource Reader View */}
        <div className="w-1/2 p-6 overflow-y-auto border-r border-black/5 dark:border-white/5 pb-20">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Library
          </Link>

          <div className="flex gap-6 mb-8 mt-2">
            <div className={`shrink-0 w-32 h-44 rounded-xl shadow-lg border border-black/5 flex items-center justify-center bg-gradient-to-br to-background p-1 ${getCoverColor(resource.title)}`}>
               {resource.thumbnail ? (
                  <img src={resource.thumbnail} alt="cover" className="w-full h-full object-cover rounded-lg" />
               ) : (
                  <FileText className="h-10 w-10 text-foreground/50" />
               )}
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                 <span>{resource.subject}</span>
                 <span>•</span>
                 <span>{resource.resource_type}</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold mb-1">{resource.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">by {resource.author}</p>
              
              <div className="flex items-center gap-4 text-sm font-medium">
                 <span className="flex items-center gap-1"><Download className="h-4 w-4" /> {resource.downloads}</span>
                 <span className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-500" /> {resource.rating}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* TTS Audio Podcast Engine */}
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                   className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105"
                 >
                   {isPlayingAudio ? (
                     <div className="w-3 h-3 bg-white rounded-sm animate-pulse" />
                   ) : (
                     <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                   )}
                 </button>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                     <Sparkles className="h-3 w-3" /> Audio Podcast Generation
                   </span>
                   <span className="text-sm font-medium text-foreground">Listen to this document via AI Voice</span>
                 </div>
               </div>
               
               {isPlayingAudio && (
                 <div className="flex items-center gap-1">
                   <div className="h-3 w-1 bg-primary/60 rounded-full animate-[bounce_1s_infinite_100ms]"></div>
                   <div className="h-5 w-1 bg-primary/80 rounded-full animate-[bounce_1s_infinite_300ms]"></div>
                   <div className="h-4 w-1 bg-primary/50 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                   <div className="h-6 w-1 bg-primary/90 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                   <div className="h-3 w-1 bg-primary/40 rounded-full animate-[bounce_1s_infinite_50ms]"></div>
                 </div>
               )}
            </div>

            <section className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 border border-black/5 dark:border-white/5 relative group">
              {/* Translate Overlay Hack */}
              <div className="absolute -top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2 shadow-lg rounded-full bg-white dark:bg-black p-1 border border-black/10 dark:border-white/10">
                 <button onClick={() => setShowTranslate(true)} className="px-3 py-1 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">Translate</button>
                 <button onClick={() => setActiveTab("flashcards")} className="px-3 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors flex items-center gap-1"><Sparkles className="h-3 w-3" /> Make Flashcards</button>
              </div>

              <h2 className="font-bold mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Abstract</h2>
              
              {showTranslate ? (
                 <p className="text-primary leading-relaxed font-medium bg-primary/10 p-2 rounded-lg">
                   [TRANSLATED (Español)] El contenido simulado de este material provee perspectivas fundamentales sobre las matemáticas de la complejidad. Este texto es teóricamente transmitido en tiempo real.
                 </p>
              ) : (
                 <p className="text-muted-foreground leading-relaxed selection:bg-primary/20">
                   {resource.description}
                   <br/><br/>
                   This is a simulated reading pane viewing the contents of the document. The text rendered here theoretically streams directly from an S3 bucket or local blob store.
                   The AI on the right has parsed all embeddings of this document successfully. Highlight any specific words to translate instantly.
                 </p>
              )}
            </section>

            <section className="flex items-center gap-3">
               {resource.tags?.map((tag) => (
                 <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                   #{tag}
                 </span>
               ))}
               {resource.difficulty && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase",
                  resource.difficulty === "Advanced" ? "bg-red-500/20 text-red-600 dark:text-red-400" : 
                  resource.difficulty === "Intermediate" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : 
                  "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                )}>
                  {resource.difficulty}
                </span>
              )}
            </section>
          </div>
        </div>

        {/* Right Column: AI RAG & Flashcards Bento sidebar */}
        <div className="w-1/2 flex flex-col bg-slate-50 dark:bg-black/20">
          <header className="p-4 bg-white/50 dark:bg-black/40 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center justify-between gap-3">
             <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                 <Sparkles className="h-4 w-4" />
               </div>
               <div className="flex items-center gap-6">
                 <button onClick={() => setActiveTab("chat")} className={cn("font-bold text-sm border-b-2 pb-1 transition-colors", activeTab === "chat" ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>Chat / Tutor</button>
                 <button onClick={() => setActiveTab("flashcards")} className={cn("font-bold text-sm border-b-2 pb-1 transition-colors", activeTab === "flashcards" ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}>Flashcards</button>
               </div>
             </div>
          </header>

          {activeTab === "chat" ? (
             <>
               <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
             {messages.map((m, i) => (
               <div key={i} className={`flex items-start gap-4 ${m.role === "ai" ? "" : "flex-row-reverse"}`}>
                 <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${m.role === "ai" ? "bg-primary text-white" : "bg-black/10 dark:bg-white/10"}`}>
                   {m.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                 </div>
                 <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${m.role === "ai" ? "bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm" : "bg-primary text-primary-foreground"}`}>
                   {m.content}
                 </div>
               </div>
             ))}
             {isTyping && (
               <div className="flex items-start gap-4">
                 <div className="shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                   <Bot className="h-4 w-4" />
                 </div>
                 <div className="p-4 rounded-2xl max-w-[80%] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm flex items-center gap-2 text-muted-foreground text-sm">
                   <Loader2 className="h-4 w-4 animate-spin text-primary" /> Analyzing PDF Embeddings...
                 </div>
               </div>
             )}
          </div>

          {/* Quick Prompts */}
          <div className="px-6 pb-2 pt-2 flex items-center gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
            {["Summarize this", "Explain the hardest concept", "List key takeaways"].map((p) => (
              <button 
                key={p} 
                onClick={() => setQuery(p)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="p-4 bg-white/50 dark:bg-black/40 backdrop-blur-md border-t border-black/5 dark:border-white/5">
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                placeholder="Ask a question about this document..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-full py-3.5 pl-6 pr-14 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow shadow-sm"
              />
              <button 
                type="submit"
                disabled={!query.trim() || isTyping}
                className="absolute inset-y-1.5 right-1.5 h-[calc(100%-12px)] aspect-square bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
              >
                <Send className="h-4 w-4 -ml-0.5" />
              </button>
            </form>
          </div>
          </>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 bg-accent/5 flex flex-col items-center">
               <div className="w-full max-w-sm aspect-[4/3] bg-white dark:bg-black/80 rounded-3xl shadow-xl border border-black/10 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] transition-transform group">
                 <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Click to flip</span>
                 <h3 className="font-display text-2xl font-black mb-2 group-hover:text-primary transition-colors">What is Big O Notation?</h3>
                 <p className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-8 text-sm px-6">Theoretical measure of the execution of an algorithm, usually the time or memory needed, given the problem size n.</p>
               </div>
               <div className="flex items-center gap-4 mt-8">
                 <button className="px-5 py-2 rounded-full border border-black/10 dark:border-white/10 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Previous</button>
                 <span className="text-xs font-bold text-muted-foreground">1 / 14</span>
                 <button className="px-5 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-colors">Next Card</button>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Gamified Badge Unlock Overlay */}
      {showBadge && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in slide-in-from-bottom-20 duration-500">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-black/80 backdrop-blur-xl border border-amber-500/30 p-6 shadow-2xl flex items-center gap-5 pr-14">
            <button 
              onClick={() => setShowBadge(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-[2px] shadow-[0_0_30px_rgba(245,158,11,0.4)] relative">
               <div className="absolute inset-0 bg-white dark:bg-black/50 rounded-full animate-ping opacity-20 hidden md:block"></div>
               <div className="flex h-full w-full items-center justify-center rounded-full bg-background relative z-10">
                 <Trophy className="h-8 w-8 text-amber-500 drop-shadow-md" />
               </div>
            </div>
            
            <div className="flex flex-col">
               <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">Achievement Unlocked!</span>
               <span className="font-display text-xl font-bold text-foreground leading-tight">Topic Master</span>
               <span className="text-xs font-medium text-muted-foreground mt-1 max-w-[200px]">
                 You've extracted valuable insights from 5 deep-tech resources!
               </span>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Escalation Overlay overlay mounted over the chat pane */}
      {escalationSuggestion && (
         <div className="absolute top-[100px] right-6 z-50 animate-in fade-in zoom-in-95 duration-500 drop-shadow-2xl">
            <div className="w-[340px] bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-primary/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
               <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/10 rounded-full blur-2xl"></div>
               
               <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                   <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                     <ArrowUpRight className="h-3 w-3" />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-widest text-primary">Ready to Level Up?</span>
                 </div>
                 <button onClick={() => setEscalationSuggestion(null)} className="text-muted-foreground hover:text-foreground">
                   <X className="h-4 w-4" />
                 </button>
               </div>

               <h3 className="font-display font-black text-lg leading-tight mb-2">You've mastered this Beginner guide!</h3>
               <p className="text-xs text-muted-foreground mb-4">The algorithm suggests escalating directly to an <strong>Intermediate</strong> text:</p>

               <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/5 dark:border-white/5">
                 <span className="text-[10px] uppercase font-bold text-muted-foreground">{escalationSuggestion.subject}</span>
                 <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{escalationSuggestion.title}</h4>
                 <Link onClick={() => setEscalationSuggestion(null)} href={`/resource/${escalationSuggestion.id}`} className="mt-3 w-full block text-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 text-xs transition-colors">
                    Start Intermediate Material
                 </Link>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
