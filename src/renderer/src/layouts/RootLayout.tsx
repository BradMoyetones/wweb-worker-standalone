import { Cog } from '@/components/animate-ui/icons/cog';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Menu } from '@/components/animate-ui/icons/menu';
import { Section, SectionContent } from '@/components/section';
import { Sidebar, SidebarContent, SidebarTrigger } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router';
import Advanced from './components/settings/Advanced';
import Theming from './components/settings/Theming';
import Me from './components/settings/Me';
import Versions from '@/components/Versions';
import Footer from '@/components/footer';
import { UpdateNotification } from '@/components/UpdateNotification';
import { useWhatsApp } from '@/contexts';
import { Badge } from '@/components/ui/badge';
import { WhatsAppStatusModal } from '@/components/WhatsAppStatusModal';

export default function RootLayout() {
    const [isOpen, setIsOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const { status } = useWhatsApp();
    return (
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}>
            hola
        </Sidebar>
    );
}
