"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar Content Goes Here */}
        <main className="flex-1 p-4">
          {/* Main Content */}
          <h1>Welcome to PillPal</h1>
          <p>Your personal medication companion.</p>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
