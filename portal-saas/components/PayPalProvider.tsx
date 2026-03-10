"use client"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider options={{
      clientId: clientId,
      vault: true,
      intent: "subscription",
      "enable-funding": "card"
    }}>
      {children}
    </PayPalScriptProvider>
  )
}
