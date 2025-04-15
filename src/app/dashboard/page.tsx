"use client";

import Dashboard from "@/components/dashboard";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
    return (
        <SidebarProvider>
            <div className="flex h-screen">
                <Sidebar>
                    <SidebarHeader>
                        <h2>PillPal</h2>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Icons.barChart className="mr-2 h-4 w-4" />
                                    Dashboard
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Icons.messageCircle className="mr-2 h-4 w-4" />
                                    Chat Companion
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                        <Button variant="outline">Settings</Button>
                    </SidebarFooter>
                </Sidebar>
                <main className="flex-1 p-4">
                    <Dashboard />
                </main>
            </div>
        </SidebarProvider>
    );
};

export default DashboardPage;
