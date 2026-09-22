"use client";

import { type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  url: string;
  icon?: Icon;
  iconColor?: string;
  iconBg?: string;
  badge?: number;
  items?: {
    title: string;
    url: string;
    badge?: number;
  }[];
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const isActive =
              item.url === "/portal" || item.url === "/dashboard"
                ? pathname === item.url
                : pathname === item.url || pathname.startsWith(item.url + "/");
            const hasSubitems = item.items && item.items.length > 0;

            const iconElement = item.icon ? (
              <div
                className={cn(
                  "size-6.5 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200",
                  item.iconBg || "bg-primary/10 border-primary/15",
                  item.iconColor || "text-primary",
                  isActive
                    ? "shadow-xs ring-1 ring-primary/25 scale-102"
                    : "group-hover/menu-button:scale-105 group-hover/menu-button:shadow-xs",
                )}
              >
                <item.icon className="size-3.5" strokeWidth={2} />
              </div>
            ) : null;

            if (hasSubitems) {
              return (
                <Collapsible key={item.title} asChild defaultOpen={isActive}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        className="gap-2.5 py-2 px-2.5 rounded-xl transition-colors group/menu-button"
                      >
                        {iconElement}
                        <span className="font-semibold text-xs tracking-tight">{item.title}</span>
                        <IconChevronRight className="ml-auto size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-5 pl-2.5 border-l border-border/50 my-0.5 space-y-0.5">
                        {item.items!.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                              className="rounded-lg h-7.5 text-xs transition-colors"
                            >
                              <Link href={subItem.url}>
                                <span className={cn(
                                  pathname === subItem.url ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"
                                )}>
                                  {subItem.title}
                                </span>
                                {subItem.badge !== undefined &&
                                  subItem.badge > 0 && (
                                    <span className="ml-auto flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                                      {subItem.badge > 99
                                        ? "99+"
                                        : subItem.badge}
                                    </span>
                                  )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className="gap-2.5 py-2 px-2.5 rounded-xl transition-colors group/menu-button"
                >
                  <Link href={item.url}>
                    {iconElement}
                    <span className="font-semibold text-xs tracking-tight">{item.title}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
