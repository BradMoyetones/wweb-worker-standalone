import { Cog } from '@/components/animate-ui/icons/cog';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Menu } from '@/components/animate-ui/icons/menu';
import { Section, SectionContent } from '@/components/section';
import { Sidebar, SidebarContent, SidebarTrigger } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router';
import Versions from '@/components/Versions';
import Footer from '@/components/footer';
import { UpdateNotification } from '@/components/UpdateNotification';
import { useWhatsApp } from '@/contexts';
import { Badge } from '@/components/ui/badge';
import { WhatsAppStatusModal } from '@/components/WhatsAppStatusModal';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/layouts/components/app-sidebar';

export default function RootLayout() {
    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "25rem",
                "--sidebar-width-mobile": "25rem",
            } as React.CSSProperties}
        >
            <AppSidebar />
            <main className='flex-1 @container p-4 bg-card rounded-lg m-2 border'>
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center fixed inset-0">
                            <div className="animate-spin size-20 rounded-full border-t-4 border-primary/80" />
                        </div>
                    }
                >
                    <Outlet />
                </Suspense>
            </main>
            <UpdateNotification />
        </SidebarProvider>
    );
}
