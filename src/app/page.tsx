"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Search, Sparkles, Filter, TrendingUp, Download, Star, Trophy, Target, Medal, Flame, Mic, Bot } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { mockResources, searchResources, mockLeaderboard, getForYouResources, getTrendingResources } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const uniqueSubjects = useMemo(() => Array.from(new Set(mockResources.map(r => r.subject))), []);
  const uniqueTypes = useMemo(() => Array.from(new Set(mockResources.map(r => r.resource_type))), []);

  const filteredResources = useMemo(() => {
    return searchResources(searchQuery, selectedSubject, selectedType);
  }, [searchQuery, selectedSubject, selectedType]);

  const trendingResources = useMemo(() => getTrendingResources(), []);
  const forYouResources = useMemo(() => getForYouResources(), []);

  const [isAIMode, setIsAIMode] = useState(false);
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="min-h-screen pt-20 pb-20 selection:bg-primary/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Custom Background Image */}
        <div 
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20 md:opacity-30 mix-blend-screen"
          style={{ backgroundImage: 'url("/images/bg_academic_abstract_1775579618700.png")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}
        />
        
        {/* Additional Gradients for depth */}
        <div className="absolute inset-x-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-background/30 via-background/60 to-background dark:from-black/10 dark:via-black/70 dark:to-background pointer-events-none" />
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px] opacity-50 pointer-events-none mix-blend-plus-lighter" />
        <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-accent/20 blur-[100px] opacity-50 pointer-events-none mix-blend-plus-lighter" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4" />
              <span>Discover the best academic resources</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight mb-6">
              Educational Ecosystem
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Explore carefully curated academic materials, dive into interconnected knowledge networks, or ask the AI to synthesize patterns across our entire multi-document library.
            </p>

            <div className="flex flex-col items-center justify-center w-full relative z-10">
              {/* Search Bar */}
              <div className={cn(
                "w-full max-w-2xl relative shadow-2xl rounded-full animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200 transition-all border-2",
                isAIMode ? "border-primary/50 shadow-primary/20" : "border-black/5 dark:border-white/10 shadow-black/5"
              )}>
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  {isAIMode ? <Bot className="h-6 w-6 text-primary animate-pulse" /> : <Search className="h-5 w-5 text-muted-foreground" />}
                </div>
                <input 
                  type="text" 
                  placeholder={isAIMode ? "Ask the AI to cross-reference texts... (e.g., 'What are the arguments against fossil fuels?')" : "Search physics, literature, calculus..."}
                  className={cn(
                    "w-full rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-xl py-5 pl-14 pr-40 text-foreground outline-none transition-all text-lg font-medium",
                    isAIMode ? "placeholder:text-primary/50" : "placeholder:text-muted-foreground/60"
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                  <button 
                    onClick={() => setIsListening(!isListening)}
                    className="h-10 w-10 flex items-center justify-center rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    aria-label="Voice Search Simulator"
                  >
                    <Mic className={cn("h-5 w-5", isListening ? "text-red-500 animate-pulse" : "")} />
                  </button>
                  <div className="w-[1px] h-6 bg-black/10 dark:bg-white/10"></div>
                  <button 
                    onClick={() => setIsAIMode(!isAIMode)}
                    className={cn(
                      "h-10 px-4 flex items-center justify-center rounded-full font-bold text-sm transition-all shadow-sm border",
                      isAIMode ? "bg-primary text-white border-transparent" : "bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10 border-black/10 dark:border-white/10"
                    )}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isAIMode ? "AI Mode: ON" : "AI Mode"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-6 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 p-6 backdrop-blur-md sticky top-28 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Filters</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Subject</h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setSelectedSubject("")}
                    className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${!selectedSubject ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 hover:text-foreground'}`}
                  >
                    All Subjects
                  </button>
                  {uniqueSubjects.map(sub => (
                    <button 
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${selectedSubject === sub ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 hover:text-foreground'}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resource Type</h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setSelectedType("")}
                    className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${!selectedType ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 hover:text-foreground'}`}
                  >
                    All Types
                  </button>
                  {uniqueTypes.map(type => (
                    <button 
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${selectedType === type ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 hover:text-foreground'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gamification Leaderboard Panel */}
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 p-6 backdrop-blur-md shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <h2 className="font-display text-xl font-bold">Top Contributors</h2>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">This Week</span>
             </div>

             <div className="space-y-4">
                {mockLeaderboard.map((user, idx) => (
                  <div key={user.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                         <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-accent/50 to-primary/50 p-[2px] transition-transform group-hover:scale-105">
                           <div className="flex h-full w-full items-center justify-center rounded-full bg-background relative overflow-hidden">
                             <span className="text-xs font-bold">{user.avatarFallback}</span>
                           </div>
                         </div>
                         {idx < 3 && (
                           <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-amber-400 rounded-full border-2 border-background flex items-center justify-center text-[8px] font-black text-amber-900">
                             {idx + 1}
                           </div>
                         )}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-bold text-foreground">{user.name}</span>
                         <span className="text-[10px] font-semibold text-primary">{user.badges[0]}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md text-muted-foreground">{user.points} <span className="text-[9px]">pts</span></span>
                  </div>
                ))}
             </div>
          </div>

          {/* Hot Topics Suggestions Panel */}
          <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/20 p-6 backdrop-blur-md shadow-sm">
             <div className="flex items-center gap-2 mb-6">
                <Flame className="h-5 w-5 text-orange-500" />
                <h2 className="font-display text-xl font-bold">Hot Topics</h2>
             </div>
             
             <div className="flex flex-col gap-3">
               {trendingResources.map((r, i) => (
                 <Link href={`/resource/${r.id}`} key={`hot-${r.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                    <div className="text-xl font-black text-muted-foreground/30 group-hover:text-primary transition-colors">0{i+1}</div>
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{r.title}</span>
                       <span className="text-[10px] text-muted-foreground uppercase">{r.downloads.toLocaleString()} downloads</span>
                    </div>
                 </Link>
               ))}
             </div>
          </div>
        </aside>

        {/* Results Grid / RAG View Switch */}
        <main className="lg:col-span-3 space-y-12">
          
          {isAIMode && searchQuery ? (
             <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 shadow-xl relative overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-10">
                <div className="absolute -right-20 -top-20 h-64 w-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                   <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                     <Bot className="h-6 w-6" />
                   </div>
                   <div>
                     <h2 className="font-display font-black text-2xl tracking-tight text-foreground">Global Knowledge Synthesis</h2>
                     <p className="text-sm font-medium text-primary">Cross-referencing 6 distinct texts</p>
                   </div>
                </div>
                <div className="relative z-10 text-base leading-relaxed text-foreground/80 space-y-4">
                  <p>Based on our database, the consensus regarding <strong>"{searchQuery}"</strong> is highly interrelated across Physics and Algorithms.</p>
                  <p>1. <strong>Hardware Limitations:</strong> The text <em>"Machine Learning with Neural Networks"</em> explicitly notes hardware optimization challenges preventing infinite scaling.<br/>
                  2. <strong>Physics Bounds:</strong> In <em>"Quantum Mechanics Fundamentals"</em>, thermodynamic equations outline strict heat dissipation boundaries restricting massive compute farms.<br/>
                  3. <strong>Algorithmic Efficiency:</strong> Conversely, <em>"Introduction to Algorithm Analysis"</em> emphasizes that complexity (Big O) software optimizations can circumvent fossil-fuel/physical hardware dependencies significantly.</p>
                  <div className="bg-white/50 dark:bg-black/30 border border-black/10 dark:border-white/10 p-4 rounded-2xl mt-6">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mr-2 tracking-widest">Citations used:</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-black/5 dark:bg-white/5 mr-2">Machine Learning (2024)</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-black/5 dark:bg-white/5 mr-2">Algorithm Analysis (2024)</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-black/5 dark:bg-white/5 mr-2">Quantum Mechanics (2024)</span>
                  </div>
                </div>
             </div>
          ) : (
            <>
              {/* For You Contextual Pipeline */}
          {!searchQuery && !selectedSubject && !selectedType && (
            <section className="relative w-full rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 overflow-hidden">
              <div className="p-8 pb-4">
                <div className="flex flex-col mb-6">
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
                    <Sparkles className="h-6 w-6 text-primary" /> For You
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium mt-1">Inferred specifically from your interests in Physics & Algorithms</p>
                </div>
                
                <div className="flex items-center gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x">
                  {forYouResources.map(resource => (
                    <div className="min-w-[320px] max-w-[350px] snap-center shrink-0" key={`foryou-${resource.id}`}>
                      <ResourceCard resource={resource} className="h-full border-primary/20 bg-white dark:bg-black/40 hover:border-primary/40" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All Library section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                {searchQuery || selectedSubject || selectedType ? "Search Results" : "Complete Library"}
              </h2>
              <span className="text-sm text-muted-foreground font-medium bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-black/10 dark:border-white/10">
                {filteredResources.length} results
              </span>
            </div>
            
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10 border-dashed">
                <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold mb-2">No resources found</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  We couldn't find any resources matching your current filters. Try adjusting your search query or categories.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubject("");
                    setSelectedType("");
                  }}
                  className="mt-6 text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
          </>
          )}
        </main>
      </div>
    </div>
  );
}
