"use client"

import type * as React from "react"
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Target,
  Activity,
  BarChart3,
  Settings,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Trading AI",
    email: "ai@tradingplatform.com",
    avatar: "/placeholder-user.jpg",
  },
  teams: [
    {
      name: "Trading AI",
      logo: GalleryVerticalEnd,
      plan: "Professional",
    },
    {
      name: "Portfolio Manager",
      logo: AudioWaveform,
      plan: "Premium",
    },
    {
      name: "Risk Analytics",
      logo: Command,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Stock Picker",
      url: "#stock-picker",
      icon: Target,
      isActive: true,
      items: [
        {
          title: "AI Stock Discovery",
          url: "#",
        },
        {
          title: "Individual Analysis",
          url: "#",
        },
        {
          title: "Bulk Generation",
          url: "#",
        },
      ],
    },
    {
      title: "Day Trading",
      url: "#day-trading",
      icon: Activity,
      items: [
        {
          title: "Live Signals",
          url: "#",
        },
        {
          title: "Market Scanner",
          url: "#",
        },
        {
          title: "Risk Management",
          url: "#",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#analytics",
      icon: BarChart3,
      items: [
        {
          title: "Performance",
          url: "#",
        },
        {
          title: "Market Data",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#settings",
      icon: Settings,
      items: [
        {
          title: "API Configuration",
          url: "#",
        },
        {
          title: "Trading Preferences",
          url: "#",
        },
        {
          title: "Notifications",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Live Market Data",
      url: "#",
      icon: Frame,
    },
    {
      name: "AI Analysis Engine",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Risk Calculator",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
