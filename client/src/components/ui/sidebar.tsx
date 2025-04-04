import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import {
  ChartBarStacked,
  Clock,
  ClipboardList,
  Users,
  CheckSquare,
  UserCog,
  Settings,
  FileText,
  History,
  Home
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
}

const SidebarItem = ({ href, icon, title, isActive }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive 
            ? "text-primary-foreground bg-primary" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: "h-5 w-5 mr-2"
        })}
        {title}
      </a>
    </Link>
  );
};

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => {
  return (
    <div>
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const isManager = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <aside className="hidden md:block w-64 bg-card border-r overflow-y-auto h-[calc(100vh-4rem)]">
      <div className="py-4 space-y-4">
        <SidebarSection title="Dashboard">
          <SidebarItem
            href="/"
            icon={<Home />}
            title="Dashboard"
            isActive={isActive("/")}
          />
        </SidebarSection>

        <SidebarSection title="Attendance">
          <SidebarItem
            href="/attendance"
            icon={<Clock />}
            title="Clock In/Out"
            isActive={isActive("/attendance")}
          />
          <SidebarItem
            href="/records"
            icon={<ClipboardList />}
            title="My Records"
            isActive={isActive("/records")}
          />
        </SidebarSection>

        {isManager && (
          <SidebarSection title="Management">
            <SidebarItem
              href="/team"
              icon={<Users />}
              title="Team Overview"
              isActive={isActive("/team")}
            />
            <SidebarItem
              href="/approvals"
              icon={<CheckSquare />}
              title="Approvals"
              isActive={isActive("/approvals")}
            />
          </SidebarSection>
        )}

        {isAdmin && (
          <SidebarSection title="Administration">
            <SidebarItem
              href="/users"
              icon={<UserCog />}
              title="User Management"
              isActive={isActive("/users")}
            />
            <SidebarItem
              href="/settings"
              icon={<Settings />}
              title="System Settings"
              isActive={isActive("/settings")}
            />
            <SidebarItem
              href="/reports"
              icon={<FileText />}
              title="Reports"
              isActive={isActive("/reports")}
            />
            <SidebarItem
              href="/audit-logs"
              icon={<History />}
              title="Audit Logs"
              isActive={isActive("/audit-logs")}
            />
          </SidebarSection>
        )}
      </div>
    </aside>
  );
}
