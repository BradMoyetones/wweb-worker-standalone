import { Cog } from "@/components/animate-ui/icons/cog";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { Menu } from "@/components/animate-ui/icons/menu";
import { Section, SectionContent } from "@/components/section";
import { Sidebar, SidebarContent, SidebarTrigger } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Suspense, useState } from "react";
import { Outlet } from "react-router";
import Advanced from "./components/settings/Advanced";
import Theming from "./components/settings/Theming";
import Me from "./components/settings/Me";
import Versions from "@/components/Versions";

export default function RootLayout() {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="max-w-7xl w-full mx-auto z-10 sticky top-0 flex items-center justify-between px-8 py-4 bg-background/20 backdrop-blur-sm rounded-b-full border-b shadow">
                <h1 className="font-extrabold text-2xl bg-linear-to-r from-primary to-foreground/50 text-transparent bg-clip-text drop-shadow-[0_0_2px_var(--primary)]">WWEB Worker</h1>
                <SidebarTrigger asChild>
                    <AnimateIcon animateOnHover>
                        <Button 
                            variant="ghost" 
                            size="icon"
                        >
                            <Cog className={"size-6"}/>
                        </Button>
                    </AnimateIcon>
                </SidebarTrigger>
            </div>
            <Section>
                <SectionContent>
                    <Suspense fallback={<div className="flex items-center justify-center fixed inset-0"><div className="animate-spin size-20 rounded-full border-t-4 border-primary/80" /></div>}>
                        <Outlet />
                    </Suspense>
                </SectionContent>
            </Section>

            <SidebarContent className="max-w-screen overflow-y-auto gap-0">
                <div className="flex justify-between items-center sticky -top-6 bg-background/10 backdrop-blur-xl border-b -mx-6 -mt-6 px-6 py-4">
                    <span className="text-sm font-semibold text-muted-foreground">Menu</span>
                    <AnimateIcon animate>
                        <Button 
                            variant={"ghost"} 
                            size={"icon"} 
                            onClick={() => setIsOpen(false)}
                        >
                            <Menu className={"size-6"} />
                        </Button>
                    </AnimateIcon>
                </div>
                <div className="flex flex-col gap-4 mt-4">
                    <div className="columns-1 md:columns-2 space-x-4 space-y-4 [&>div]:break-inside-avoid-column">
                        {/* Settings Section */}
                        <Me />

                        <Theming />

                        <Advanced />

                        <Versions></Versions>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />
                </div>
            </SidebarContent>
        </Sidebar>
    )
}
