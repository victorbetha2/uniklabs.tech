# Configuración de Webhooks

Para que la aplicación funcione correctamente, debes configurar los siguientes webhooks. Estos son esenciales para mantener sincronizada la base de datos con los servicios externos (Clerk y PayPal).

## 📍 URLs de Webhooks

Dependiendo de dónde estés trabajando (local o producción), las URLs cambian:

### **A. Desarrollo Local (Testing)**
Para probar webhooks en tu computadora, necesitas una URL pública (puedes usar [ngrok](https://ngrok.com/)).
*   **Comando:** `npx ngrok http 3000`
*   **URL de Clerk:** `https://tu-id-ngrok.ngrok-free.app/api/webhooks/clerk`
*   **URL de PayPal:** `https://tu-id-ngrok.ngrok-free.app/api/webhooks/paypal`

### **B. Producción (Oficial)**
Estas son las URLs finales para tu dominio oficial.
*   **URL de Clerk:** `https://uniklabs.tech/api/webhooks/clerk`
*   **URL de PayPal:** `https://uniklabs.tech/api/webhooks/paypal`

---

## 1. Clerk Webhooks

**¿Para qué sirve?**
Clerk maneja la autenticación, pero nuestra base de datos (`Prisma/Postgres`) necesita saber quiénes son los usuarios para asignarles suscripciones, aplicaciones y permisos. Sin este webhook:
1. El usuario se registra en Clerk.
2. Clerk nos avisa (`user.created`).
3. Nosotros lo guardamos en nuestra DB.

**Pasos:**
1. Ve al [Clerk Dashboard](https://dashboard.clerk.com/) -> Webhooks.
2. Crea un endpoint con la URL correspondiente (Local o Prod).
3. **Eventos a seleccionar:**
   - `user.created`: **Sincronización inicial.** Crea el registro del usuario en nuestra DB local.
   - `user.updated`: **Actualización de perfil.** Sincroniza cambios en nombre o correo.
4. **Variable .env:** Copia el "Signing Secret" y agrégalo como `CLERK_WEBHOOK_SECRET`.

---

## 2. PayPal Webhooks

**¿Para qué sirve?**
Las suscripciones son eventos de "larga duración". PayPal debe avisarnos cada mes si el pago se realizó con éxito o si hubo un error. 

**Pasos:**
1. Ve al [PayPal Developer Portal](https://developer.paypal.com/dashboard/applications).
2. Cambia a **"Live"** para producción o quédate en **"Sandbox"** para pruebas.
3. Agrega un webhook con la URL correspondiente (Local o Prod).
4. **Eventos a seleccionar:**
   - `BILLING.SUBSCRIPTION.ACTIVATED`: Activa el acceso del usuario en el portal.
   - `BILLING.SUBSCRIPTION.CANCELLED`: Registra la cancelación para desactivar servicios al final del periodo.
   - `BILLING.SUBSCRIPTION.EXPIRED`: Registra el fin natural del plan.
   - `PAYMENT.SALE.COMPLETED`: Muy importante para guardar el **Historial de Pagos** de cada mes.
5. **Variable .env:** Copia el "Webhook ID" y agrégalo como `PAYPAL_WEBHOOK_ID`.
