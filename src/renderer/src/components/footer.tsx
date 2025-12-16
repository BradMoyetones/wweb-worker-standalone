import { useVersion } from "@/contexts";
import { cn } from "@/lib/utils";
import { Github, Instagram } from "lucide-react";
import { buttonVariants } from "./ui/button";

export default function Footer() {
    const {appVersion} = useVersion()
    return (
        <footer className="max-w-7xl w-full mx-auto flex items-center justify-between px-8 py-4 border-t shadow text-sm">
            <div>
                <h1 className="font-extrabold bg-linear-to-r from-primary to-foreground/50 text-transparent bg-clip-text drop-shadow-[0_0_2px_var(--primary)]">
                    WWEB Worker
                </h1>
                <p className="text-muted-foreground text-xs">Versión {appVersion?.currentVersion}</p>

                <Link href="https://github.com/BradMoyetones">
                    <Github />
                </Link>
                <Link href="https://www.instagram.com/its.bradn">
                    <Instagram />
                </Link>
            </div>
            <div className="text-muted-foreground">
                <p>
                    &copy; {new Date().getFullYear()} Brad Moyetones. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}

type LinkProps = React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>

const Link = ({className, ...rest}: LinkProps) => {
    return (
        <a className={cn(buttonVariants({variant: "ghost", size: "icon"}), className)} {...rest} />
    )
}