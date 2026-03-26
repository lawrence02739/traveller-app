import type { ReactNode } from 'react';
export interface NavItem {
    label: string;
    badge?: string;
}
export interface DashboardLayoutProps {
    portalTitle: string;
    navItems: NavItem[];
    activeLabel: string;
    userName: string;
    userRole: string;
    pageTitle: string;
    pageSubtitle: string;
    headerActions?: ReactNode;
    children: ReactNode;
}
