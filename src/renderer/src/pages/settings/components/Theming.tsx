import { AnimatedThemeToggler } from '@/components/animated-theme-toggler';

export default function Theming() {
    return (
        <div className='break-before-avoid'>
            <h1 className="text-2xl font-bold">Personalización</h1>
            <div className="flex flex-col gap-3 mt-4 border rounded-lg p-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-md transition-colors">
                    <span className="text-sm">Tema</span>
                    <AnimatedThemeToggler variant={"ghost"} size={"icon"} />
                </div>                
            </div>
        </div>
    );
}
