"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface UserData {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: "super_admin" | "admin" | "agent";
    active: boolean;
}

export default function AdminLayoutContent({
    children,
    user,
}: {
    children: React.ReactNode;
    user: UserData;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <AdminSidebar
                user={user}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <AdminHeader
                    user={user}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
                <main className="p-6 flex-1">{children}</main>
            </div>
        </>
    );
}
