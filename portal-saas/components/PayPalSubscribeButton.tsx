"use client"
import { PayPalButtons } from "@paypal/react-paypal-js"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Props {
  paypalPlanId: string   // ID del plan en PayPal (viene de DB: plans.paypal_plan_id)
  appId: string          // Slug de la app
  planName: string       // Nombre del plan (e.g., "Starter")
}

export function PayPalSubscribeButton({ paypalPlanId, appId, planName }: Props) {
  const router = useRouter()

  return (
    <PayPalButtons
      style={{ layout: "vertical", color: "black", shape: "rect", label: "subscribe" }}
      createSubscription={(data, actions) => {
        return actions.subscription.create({ plan_id: paypalPlanId })
      }}
      onApprove={async (data) => {
        const res = await fetch("/api/subscriptions/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paypalSubscriptionId: data.subscriptionID,
            appId,
            plan: planName
          })
        })
        if (res.ok) {
          toast.success("¡Suscripción activada!")
          router.push("/dashboard")
        } else {
          const errorData = await res.json()
          toast.error(errorData.error || "Error al activar la suscripción")
        }
      }}
      onError={(err) => {
        console.error("PayPal error:", err)
        toast.error("Error en el pago, intenta de nuevo")
      }}
    />
  )
}
