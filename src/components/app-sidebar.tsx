"use client";

import * as React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  IconLayoutDashboard,
  IconAffiliate,
  IconUsers,
  IconWallet,
  IconShieldLock,
  IconSettings,
  IconApi,
  IconTargetArrow,
  IconBinary,
  IconWorld,
  type Icon as TablerIcon,
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
// 1. Tambahkan "owner" ke dalam tipe RoleName
type RoleName = "superadmin" | "agent" | "owner";

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
      // {
      //   title: "Sales",
      //   url: "/cms/agents",
      //   icon: IconUsers,
      //   children: [
      //     { title: "Active Agents", url: "/cms/agents" },
      //     { title: "Invitations & Filters", url: "/cms/agents/invites" },
      //     { title: "Domain Restrictions", url: "/cms/agents/domains" },
      //   ],
      // },
      // {
      //   title: "Earnings & Payouts",
      //   url: "/cms/payouts",
      //   icon: IconWallet,
      //   children: [
      //     { title: "Commission Logic", url: "/cms/payouts/logic" },
      //     { title: "Payout Requests", url: "/cms/payouts/requests" },
      //     { title: "Financial Logs", url: "/cms/payouts/logs" },
      //   ],
      // },
      // { title: "Traffic Harvester", url: "/cms/traffic", icon: IconTargetArrow },
      // {
      //   title: "Security & Fraud",
      //   url: "/cms/security",
      //   icon: IconShieldLock,
      //   children: [
      //     { title: "Fraud Attempts", url: "/cms/security/fraud" },
      //     { title: "Blocked IPs", url: "/cms/security/blocked" },
      //     { title: "Verification Rules", url: "/cms/security/rules" },
      //   ],
      // },
      // {
      //   title: "System Config",
      //   url: "#",
      //   icon: IconSettings,
      //   children: [
      //     { title: "App Parameters", url: "/cms/config/params" },
      //     { title: "Multi-language (i18n)", url: "/cms/config/languages" },
      //     { title: "Asset Management", url: "/cms/config/assets" },
      //   ],
      // },
    ],
    navSecondary: [
      {
        title: "API & Integrations",
        url: "/cms/api",
        icon: IconApi,
      },
      {
        title: "Documentation",
        url: "/cms/docs",
        icon: IconBinary,
      },
    ],
  },
  // 2. Tambahkan konfigurasi menu khusus untuk Owner
  owner: {
    navMain: [
      {
        title: "Overview", // Dashboard
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
    navSecondary: [], // Kosongkan secondary jika tidak diperlukan
  },
  agent: {
    navMain: [
      { title: "Dashboard", url: "/dashboard", icon: IconLayoutDashboard },
      { title: "My Earnings", url: "/earnings", icon: IconWallet },
    ],
    navSecondary: [{ title: "Support", url: "/support", icon: IconWorld }],
  },
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  // 3. Perbarui logika penentuan role
  const userRole = session?.user?.roles?.[0]?.name;

  let roleName: RoleName = "agent"; // Default role

  if (userRole === "superadmin") {
    roleName = "superadmin";
  } else if (userRole === "owner") {
    roleName = "owner";
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

        <div className="mt-8 px-4">
          <div className="bg-gray-50 dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800">
            <p className="text-[10px] font-bold text-[#8E8E8E] uppercase tracking-widest mb-2">
              System Health
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#7ED321] rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                API Status: Online
              </span>
            </div>
          </div>
        </div>

        {/* Hanya render NavSecondary jika ada itemnya */}
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