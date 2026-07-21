import { AnimatedThemeToggler } from '@/components/animated-theme-toggler';
import { ThemeSelector } from '@/components/theme-selector';

export default function Theming() {
    return (
        <div className='break-before-avoid'>
            <h1 className="text-2xl font-bold">Personalización</h1>
            <div className="flex flex-col gap-3 mt-4 border-l pl-4">
                <div className="flex items-center justify-between px-3 py-2 rounded-md transition-colors">
                    <span className="text-sm">Tema</span>
                    <AnimatedThemeToggler variant={"ghost"} size={"icon"} />
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-md transition-colors">
                    <span className="text-sm">Color</span>
                    <ThemeSelector />
                </div>
            </div>
        </div>
    );
}
