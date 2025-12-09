import { Section, SectionContent } from "@/components/section";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import { Outlet } from "react-router";

export default function RootLayout() {
    return (
        <Section>
            <SectionContent>
                <Suspense fallback={<div className="flex items-center justify-center fixed inset-0"><Loader className="animate-spin" /></div>}>
                    <Outlet />
                </Suspense>
            </SectionContent>
        </Section>
    )
}
