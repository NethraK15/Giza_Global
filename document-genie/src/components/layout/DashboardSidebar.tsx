import { LayoutDashboard, Upload, ListTodo, FileSearch, CreditCard, LogOut, FileText, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload", url: "/dashboard/upload", icon: Upload },
  { title: "Jobs", url: "/dashboard/jobs", icon: ListTodo },
  { title: "Results", url: "/dashboard/results", icon: FileSearch },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Link to="/" className="flex items-center gap-2.5 py-1">
              <div className="gradient-primary rounded-lg p-1.5 shadow-sm">
                <FileText className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              {!collapsed && <span className="font-bold text-sidebar-foreground tracking-tight">Giza Global</span>}
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      aria-label={item.title}
                      title={collapsed ? item.title : undefined}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50 rounded-lg transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon aria-hidden="true" className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" aria-label="Log out" title={collapsed ? "Log out" : undefined} className="hover:bg-sidebar-accent/50 rounded-lg transition-colors">
                <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
                {!collapsed && <span>Log out</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
