"use client";

import * as React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  IconLayoutDashboard,
  IconAffiliate,
  IconUsers,
  IconWallet,
  IconApi,
  IconBinary,
  IconWorld,
  type Icon as TablerIcon,
  IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

/* =========================
 * Types
 * =======================*/
type RoleName = "superadmin" | "agent" | "owner" | "director" | "manager";

type NavItem = {
  title: string;
  url: string;
  icon: TablerIcon;
  children?: { title: string; url: string }[];
};

type MenuBundle = {
  navMain: NavItem[];
  navSecondary: { title: string; url: string; icon: TablerIcon }[];
};

/* =========================
 * Menu by Role
 * =======================*/
const NAV_BY_ROLE: Record<RoleName, MenuBundle> = {
  superadmin: {
    navMain: [
      { title: "Overview", url: "/cms/dashboard", icon: IconLayoutDashboard },
      {
        title: "Users & Roles",
        url: "/cms/users",
        icon: IconUsers,
        children: [
          { title: "All Users", url: "/cms/users" },
          { title: "Roles", url: "/cms/users/roles" },
        ],
      },
      {
        title: "Affiliate Programs",
        url: "/cms/programs",
        icon: IconAffiliate,
        children: [
          { title: "All Programs", url: "/cms/programs" },
          { title: "Sales of Programs", url: "/cms/programs/sales" },
          { title: "Registration", url: "/cms/programs/register" },
          { title: "Categories", url: "/cms/programs/categories" },
        ],
      },
      {
        title: "Configuration",
        url: "#",
        icon: IconSettings,
        children: [
          { title: "Top Program", url: "/cms/programs/top" },
          { title: "Top Sales", url: "/cms/programs/top-sales" },
        ],
      },
    ],
    navSecondary: [], // ✅ FIX
  },

  director: {
    navMain: [
      { title: "Overview", url: "/cms/dashboard", icon: IconLayoutDashboard },
      {
        title: "Users & Roles",
        url: "/cms/users",
        icon: IconUsers,
        children: [
          { title: "All Users", url: "/cms/users" },
          { title: "Roles", url: "/cms/users/roles" },
        ],
      },
      {
        title: "Affiliate Programs",
        url: "/cms/programs",
        icon: IconAffiliate,
        children: [
          { title: "All Programs", url: "/cms/programs" },
          { title: "Sales of Programs", url: "/cms/programs/sales" },
          { title: "Registration", url: "/cms/programs/register" },
          { title: "Categories", url: "/cms/programs/categories" },
        ],
      },
    ],
    navSecondary: [], // ✅ FIX
  },

  manager: {
    navMain: [
      { title: "Overview", url: "/cms/dashboard", icon: IconLayoutDashboard },
      {
        title: "Users & Roles",
        url: "/cms/users",
        icon: IconUsers,
        children: [
          { title: "All Users", url: "/cms/users" },
          { title: "Roles", url: "/cms/users/roles" },
        ],
      },
      {
        title: "Affiliate Programs",
        url: "/cms/programs",
        icon: IconAffiliate,
        children: [
          { title: "All Programs", url: "/cms/programs" },
          { title: "Sales of Programs", url: "/cms/programs/sales" },
          { title: "Registration", url: "/cms/programs/register" },
          { title: "Categories", url: "/cms/programs/categories" },
        ],
      },
    ],
    navSecondary: [], // ✅ FIX
  },

  owner: {
    navMain: [
      {
        title: "Overview",
        url: "/cms/dashboard",
        icon: IconLayoutDashboard,
      },
      {
        title: "Affiliate Programs",
        url: "/cms/programs",
        icon: IconAffiliate,
        children: [
          { title: "All Programs", url: "/cms/programs" },
          { title: "Sales of Programs", url: "/cms/programs/sales" },
          { title: "Registration", url: "/cms/programs/register" },
          { title: "Categories", url: "/cms/programs/categories" },
        ],
      },
    ],
    navSecondary: [],
  },

  agent: {
    navMain: [
      { title: "Dashboard", url: "/dashboard", icon: IconLayoutDashboard },
      { title: "My Earnings", url: "/earnings", icon: IconWallet },
    ],
    navSecondary: [
      { title: "Support", url: "/support", icon: IconWorld },
    ],
  },
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const userRole = session?.user?.roles?.[0]?.name as RoleName | undefined;

  let roleName: RoleName = "agent";

  if (
    userRole === "superadmin" ||
    userRole === "owner" ||
    userRole === "director" ||
    userRole === "manager"
  ) {
    roleName = userRole;
  }

  const menus = NAV_BY_ROLE[roleName];

  const userForSidebar = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "user@affiliatecore.io",
    avatar: "/avatar-admin.jpg",
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className="border-r border-gray-100 dark:border-neutral-800"
    >
      <SidebarHeader className="bg-[#4A90E2] text-white py-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-white/10 transition-colors h-14"
            >
              <a href="#" className="flex items-center gap-3">
                <Image
                  src="/kross-id.png"
                  alt="Kross ID Logo"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter leading-none uppercase">
                    Kross<span className="text-[#F2A93B]">.id</span>
                  </span>
                  <span className="text-[6px] uppercase tracking-[0.2em] font-bold opacity-80 mt-1">
                    Cross-Community Communication
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-white dark:bg-neutral-950 px-2 pt-4">
        <NavMain items={menus.navMain} />

        {menus.navSecondary.length > 0 && (
          <NavSecondary items={menus.navSecondary} className="mt-auto mb-4" />
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-50 dark:border-neutral-900 bg-white dark:bg-neutral-950">
        <NavUser user={userForSidebar} />
      </SidebarFooter>
    </Sidebar>
  );
}
