"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, File, Trash2, CheckCircle2, AlertCircle, LogOut, Sparkles, Loader2 } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { mockResources, Resource, Subject, ResourceType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState<Subject>("Computer Science");
  const [type, setType] = useState<ResourceType>("Textbook");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  
  const [isExtracting, setIsExtracting] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !selectedFile || !description) return;

    // Create Mock Resource
    const newResource: Resource = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      author,
      subject,
      resource_type: type,
      file_url: "#",
      downloads: 0,
      rating: 0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
      description,
      tags: tags.split(",").map(t => t.trim()).filter(t => t),
      difficulty
    };

    setResources([newResource, ...resources]);
    
    // Reset Form
    setTitle("");
    setAuthor("");
    setDescription("");
    setTags("");
    setSelectedFile(null);
    alert("Resource uploaded successfully!");
  };

  const handleAiExtract = async () => {
    if (!selectedFile && !title) return;
    setIsExtracting(true);
    // Mocking an LLM parsing the PDF content and returning metadata
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDescription("An AI-generated two-line summary classifying the core components of the uploaded document, optimized for rapid library scanning.");
    setTags("AI Extracted, Machine Learning, Research, Advanced Concepts");
    setDifficulty("Advanced");
    setIsExtracting(false);
  };

  const deleteResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  // Mock aggregates
  const totalDownloads = resources.reduce((acc: number, r: Resource) => acc + r.downloads, 0);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/login");
  };

  return (
    <div className="min-h-screen pt-24 pb-20 selection:bg-accent/30">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 dark:border-white/10 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-extrabold mb-2">Admin Dashboard</h1>
              <button 
                onClick={handleLogout}
                className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
            <p className="text-muted-foreground mt-1">Manage resources, track downloads, and review feedback.</p>
          </div>
          <div className="flex items-center gap-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Total Resources</span>
              <span className="text-3xl font-display font-bold text-primary">{resources.length}</span>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Total Downloads</span>
              <span className="text-3xl font-display font-bold text-accent">{totalDownloads.toLocaleString()}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1 border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl p-6 h-fit shadow-2xl shadow-black/20">
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
              <UploadCloud className="h-5 w-5 text-accent" />
              <h2 className="font-display text-xl font-bold">Upload Resource</h2>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              {/* Drag & Drop */}
              <div 
                className={cn(
                  "relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer",
                  isDragActive ? "border-primary bg-primary/10" : "border-white/20 bg-white/5 hover:border-white/40",
                  "group overflow-hidden"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx"
                />
                
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-2">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-sm text-foreground">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground group-hover:text-foreground transition-colors">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">Click or drag file to this area to upload</p>
                    <p className="text-xs opacity-70">Support for PDF, DOC, DOCX</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Title</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Advanced AI Models" />
                </div>
                
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Author(s)</label>
                  <input required value={author} onChange={e => setAuthor(e.target.value)} type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Dr. Ada Lovelace" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Subject</label>
                    <select value={subject} onChange={e => setSubject(e.target.value as Subject)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none">
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Literature">Literature</option>
                      <option value="History">History</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Type</label>
                    <select value={type} onChange={e => setType(e.target.value as ResourceType)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none">
                      <option value="Textbook">Textbook</option>
                      <option value="Research Paper">Research Paper</option>
                      <option value="Study Guide">Study Guide</option>
                      <option value="Notes">Notes</option>
                      <option value="Video Lecture">Video Lecture</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none" placeholder="Brief 2-line summary..."></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">AI Tags (comma separated)</label>
                    <input value={tags} onChange={e => setTags(e.target.value)} type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. math, integrals" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Difficulty</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* AI RAG EXTRACT BUTTON */}
                <button
                  type="button"
                  onClick={handleAiExtract}
                  disabled={isExtracting || (!selectedFile && !title)}
                  className="w-full mt-2 flex items-center justify-center gap-2 border border-accent/30 bg-accent/10 hover:bg-accent/20 text-accent font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50"
                >
                  {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isExtracting ? "AI Analyzing PDF Context..." : "Auto-Generate Metadata via AI"}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={!selectedFile}
                className="w-full mt-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary text-primary-foreground font-bold py-3.5 px-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] active:scale-95"
              >
                Upload to Library
              </button>
            </form>
          </div>

          {/* Resource Management Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Manage Resources</h2>
            </div>
            
            <div className="border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
              <div className="overflow-x-auto min-h-[500px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground font-display">Resource Details</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground font-display">Subject / Type</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground font-display text-right">Stats</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground font-display text-right flex justify-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {resources.map((resource: Resource) => (
                      <tr key={resource.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                        <td className="p-4 max-w-[250px]">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0 p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                              <File className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm line-clamp-1">{resource.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{resource.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex w-fit items-center rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-medium text-foreground">
                              {resource.subject}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">{resource.resource_type}</span>
                              {resource.difficulty && (
                                <span className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase",
                                  resource.difficulty === "Advanced" ? "bg-red-500/20 text-red-400" : 
                                  resource.difficulty === "Intermediate" ? "bg-amber-500/20 text-amber-400" : 
                                  "bg-emerald-500/20 text-emerald-400"
                                )}>
                                  {resource.difficulty}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-sm text-accent">{resource.downloads.toLocaleString()} DLs</span>
                            <span className="text-xs text-muted-foreground">{resource.rating.toFixed(1)} ★ ({resource.reviewsCount})</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => deleteResource(resource.id)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors ml-auto"
                            title="Delete Resource"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {resources.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                          <p>No resources found. Upload one to get started.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
