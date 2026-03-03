export const REPORT_APP_METADATA = {
    id: "report",
    name: "ReporT",
    slug: "report",
    badge: "Suite Empresarial",
    tagline: "Reportes y gestión sin límites",
    description: "ReporT es la plataforma empresarial de UnikLabs para generar reportes detallados, gestionar datos operacionales y mantener a tu equipo alineado.",
    stats: [
        { value: "500+", label: "Reportes al mes" },
        { value: "40+", label: "Empresas activas" },
        { value: "99.9%", label: "Uptime" }
    ],
    screenshots: [
        {
            url: "/images/apps/report/dashboard-mobile.png",
            description: "Visualización de órdenes en dispositivos móviles",
            type: "mobile"
        },
        {
            url: "/images/apps/report/dashboard-desktop.png",
            description: "Panel de control principal y próximos eventos",
            type: "desktop"
        }
    ],
    plans: [
        {
            name: "Starter",
            price: 29.0,
            userRange: "1 – 4 usuarios",
            paypalPlanId: "PAYPAL_PLAN_REPORT_STARTER"
        },
        {
            name: "Team",
            price: 69.0,
            userRange: "5 – 15 usuarios",
            paypalPlanId: "PAYPAL_PLAN_REPORT_TEAM"
        },
        {
            name: "Business",
            price: 109.0,
            userRange: "16 – 50 usuarios",
            paypalPlanId: "PAYPAL_PLAN_REPORT_BUSINESS"
        },
        {
            name: "Enterprise",
            price: 249.0,
            userRange: "Sin límite",
            paypalPlanId: "PAYPAL_PLAN_REPORT_ENTERPRISE"
        }
    ]
};
