import { ChevronRight } from 'lucide-react';

import { Icon } from '@/components/icon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { NavGroup, NavItem } from '@/types';
import { Link } from '@inertiajs/react';

export function NavMain({ items }: { items: NavGroup[] }) {
    function checkActiveUrl(url: string) {
        return location.href.startsWith(url);
    }
  function checkCollapseOpen(arr: NavItem[]) {
    return arr.some((i) => checkActiveUrl(i.url));
}
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    item.subItems && item.subItems.length >= 1 ? (
                        <Collapsible
                            key={item.title}
                            defaultOpen={checkCollapseOpen(item.subItems)}
                            className="group/collapsible"
                            asChild
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.subItems?.map((subItem) => (
                                            <SidebarMenuSubItem key={subItem.title}>
                                                <SidebarMenuSubButton asChild isActive={checkActiveUrl(subItem.url)}>
                                                    <Link href={subItem.url}>
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={checkActiveUrl(item.url)}>
                                <Link href={item.url}>
                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
