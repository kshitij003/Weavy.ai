import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#09090A]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-[#09090A]">
                <div className="mx-auto w-full p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
