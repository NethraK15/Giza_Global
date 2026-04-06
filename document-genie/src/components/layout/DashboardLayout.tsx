import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen flex w-full"
      >
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border/80 bg-background/85 backdrop-blur-md px-4 gap-3 sticky top-0 z-30">
            <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground">Dashboard</span>
            </div>
            <ThemeToggle className="h-9 w-9 rounded-full border-border/80 bg-background/90" />
          </header>
          <main className="smooth-appear flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-grid-pattern">
            <Outlet />
          </main>
        </div>
      </motion.div>
    </SidebarProvider>
  );
}
