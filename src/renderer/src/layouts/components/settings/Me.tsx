import { Card, CardContent } from "@/components/ui/card"
import { useWhatsApp } from "@/contexts"

export default function Me() {
    const {user} = useWhatsApp()
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
