import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useWhatsApp } from "@/contexts"
import { CirclePower, MessageCircle } from "lucide-react"

export default function Me() {
    const {user, chats, status} = useWhatsApp()
    return (
        <div>
            <h1 className="text-2xl font-bold">Mi Cuenta</h1>
            <div className="mt-4 border-l pl-4">
                <Card>
                    <CardContent>
                        <article className="flex gap-2 items-center">
                            <img 
                                src={user?.profilePic || ""} 
                                alt={`Perfil de ${user?.pushname}`}
                                className="size-20 rounded-full"
                            />
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {user?.pushname}
                                </h1>
                                <p className="opacity-70">
                                    +{user?.wid.user}
                                </p>
                            </div>
                        </article>
                        <div className="mt-4 space-y-4">
                            <div className="flex justify-between">
                                <h1 className="flex items-center gap-2 [&>svg]:size-5 [&>svg]:text-muted-foreground"><MessageCircle /> Chats activos</h1> <Badge>{chats.length}</Badge>
                            </div>

                            <div className="flex justify-between">
                                <h1 className="flex items-center gap-2 [&>svg]:size-5 [&>svg]:text-muted-foreground"><CirclePower /> Estado</h1> <Badge>{status === "ready" ? "Activo": "Desconectado"}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
