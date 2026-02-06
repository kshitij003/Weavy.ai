"use client";

import Link from "next/link";

import { UserButton, useUser } from "@clerk/nextjs";
import { Plus, Folder, Users, LayoutGrid } from "lucide-react";


const navigation = [
    { name: "My Files", href: "/dashboard", icon: Folder },
    { name: "Shared with me", href: "/dashboard/shared", icon: Users },
    { name: "Apps", href: "/dashboard/apps", icon: LayoutGrid },
];

export function Sidebar() {
    const { user, isLoaded } = useUser();

    return (
        <div className="flex h-screen w-64 flex-col bg-black text-gray-300 border-r border-[#1F1F21]">
            {/* User Actions */}
            <div className="p-4 space-y-4">
                {/* User Profile */}
                <div className="flex items-center gap-3 px-2 py-1">
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonBox: "flex-row-reverse gap-3",
                                userButtonOuterIdentifier: "text-white font-medium text-sm",
                            },
                        }}
                        showName
                    />
                </div>

                {/* Create New Button */}
                <Link href="/editor/untitled" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8FF86] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#d6f060] active:scale-[0.98]">
                    <Plus size={18} strokeWidth={2.5} />
                    Create New File
                </Link>
            </div>
        </div>
    );
}
