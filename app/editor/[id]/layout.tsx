"use client";

import { useState } from "react";
import { Search, Zap, PanelLeftClose, PanelLeftOpen, Type, ImagePlus, Video, Sparkles, Crop, Film } from "lucide-react";
import { cn } from "@/lib/utils";

import { useEditorStore, NodeType } from "@/app/editor/store";

export default function EditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = quickAccessItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#0e0e0e] overflow-hidden relative">
            {/* Left Icon Sidebar */}
            <aside
                className={cn(
                    "flex flex-col items-center border-r border-[#1F1F21] bg-[#09090A] py-4 h-full z-20 gap-6 transition-all duration-300 ease-in-out relative",
                    isLeftCollapsed ? "w-0 px-0 overflow-hidden border-none" : "w-16"
                )}
            >
                <div className="flex flex-col items-center gap-6 justify-center h-full">
                    <button
                        onClick={() => {
                            setIsSearchOpen(!isSearchOpen);
                            setIsQuickAccessOpen(false);
                        }}
                        className={cn(
                            "transition-colors p-2 rounded-lg hover:bg-white/5",
                            isSearchOpen ? "text-[#E8FF86] bg-white/10" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Search size={24} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => {
                            setIsQuickAccessOpen(!isQuickAccessOpen);
                            setIsSearchOpen(false);
                        }}
                        className={cn(
                            "transition-colors p-2 rounded-lg hover:bg-white/5",
                            isQuickAccessOpen ? "text-[#E8FF86] bg-white/10" : "text-gray-400 hover:text-white"
                        )}
                    >
                        <Zap size={24} strokeWidth={1.5} />
                    </button>
                </div>
            </aside>

            {/* Search Panel */}
            <div
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 rounded-xl border border-[#1F1F21] bg-[#09090A] p-3 shadow-xl transition-all duration-300 w-64 max-h-[400px]",
                    isSearchOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none",
                    isLeftCollapsed ? "left-4" : "left-20"
                )}
            >
                <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1F1F21] border border-[#2A2A2D] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#E8FF86] placeholder:text-gray-500 mb-2"
                    autoFocus
                />

                <div className="flex flex-col gap-1 overflow-y-auto">
                    {filteredItems.length === 0 ? (
                        <div className="text-gray-500 text-xs text-center py-4">
                            No nodes found
                        </div>
                    ) : (
                        filteredItems.map((item, i) => (
                            <button
                                key={i}
                                className="group flex items-center gap-3 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white rounded-lg cursor-grab active:cursor-grabbing text-left"
                                draggable
                                onDragStart={(event) => onDragStart(event, item.type)}
                                onClick={() => addNodeContent(item.type)}
                            >
                                <item.icon size={18} strokeWidth={1.5} className="shrink-0" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Access Panel */}
            <div
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 rounded-xl border border-[#1F1F21] bg-[#09090A] p-2 shadow-xl transition-all duration-300",
                    isQuickAccessOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none",
                    isLeftCollapsed ? "left-4" : "left-20"
                )}
            >
                {quickAccessItems.map((item, i) => (
                    <button
                        key={i}
                        className="group relative flex items-center justify-center p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white rounded-lg cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(event) => onDragStart(event, item.type)}
                        onClick={() => addNodeContent(item.type)}
                    >
                        <item.icon size={20} strokeWidth={1.5} />
                        {/* Tooltip */}
                        <span className="absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-[#1F1F21] px-2 py-1 text-xs text-white shadow-md group-hover:block border border-white/10 z-50">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Collapse Toggle Button (Floating or Attached) */}
            {/* Placing it absolute for now so it's accessible even when collapsed, or maybe inside the main area top left */}
            <div className="absolute left-4 top-4 z-50">
                <button
                    onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                    className="text-gray-500 hover:text-white transition-colors bg-[#09090A]/50 p-1.5 rounded-md backdrop-blur-sm border border-[#1F1F21]"
                >
                    {isLeftCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            {/* Main Content (Canvas) */}
            <main className="flex-1 relative overflow-hidden">
                {children}
            </main>
        </div>
    );
}
