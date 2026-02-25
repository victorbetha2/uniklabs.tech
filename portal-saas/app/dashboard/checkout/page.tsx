"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const appId = searchParams.get("app");
        const plan = searchParams.get("plan");

        if (!appId || !plan) {
            toast.error("Parámetros de suscripción inválidos");
            router.push("/dashboard/apps");
            return;
        }

        async function createSubscription() {
            try {
                const res = await fetch("/api/subscriptions/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ appId, plan }),
                });

                const data = await res.json();

                if (!res.ok || !data.approvalUrl) {
                    toast.error(data.error ?? "No se pudo iniciar la suscripción.");
                    router.push("/dashboard/apps");
                    return;
                }

                router.push(data.approvalUrl);
            } catch (err) {
                toast.error("Error de conexión. Intenta de nuevo.");
                router.push("/dashboard/apps");
            }
        }

        createSubscription();
    }, [searchParams, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold tracking-tight">Preparando tu suscripción...</h2>
            <p className="text-muted-foreground mt-2">Serás redirigido a PayPal de forma segura.</p>
        </div>
    );
}
