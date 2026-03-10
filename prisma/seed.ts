import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import "dotenv/config"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Upserting ReporT app...')

  // Usamos upsert para no borrar si hay dependencias (suscripciones)
  const reportApp = await prisma.app.upsert({
    where: { slug: 'report' },
    update: {
      name: 'ReporT',
      badge: 'Suite Empresarial',
      tagline: 'Reportes y gestión sin límites',
      heroAccent: 'sin límites',
      description: 'ReporT es la plataforma empresarial de UnikLabs para generar reportes detallados, gestionar datos operacionales y mantener a tu equipo alineado.',
      accessAdminUrl: 'https://reportcms.uniklabs.tech/',
      accessUserUrl: 'https://report.uniklabs.tech/',
      accessInstructionsMd: [
        '# Bienvenido a ENT Reportes',
        '',
        'Tu suscripción fue activada correctamente.',
        '',
        '## Accesos',
        '- Admin: https://reportcms.uniklabs.tech/',
        '- App Técnico: https://report.uniklabs.tech/',
        '',
        '## Siguientes pasos',
        '1. Ingresa a la App Técnico con tu usuario operativo.',
        '2. Si recibiste credenciales de administración, inicia sesión en Admin para configuración.',
        '3. Si necesitas ayuda, responde a este correo y el equipo te apoyará.',
      ].join('\\n'),
      isActive: true,
      comingSoon: false,
      iconName: 'Building2',
      tags: ['Reportes', 'Dashboard', 'Multi-usuario'],
      stats: [
        { value: '500+', label: 'Reportes al mes' },
        { value: '40+', label: 'Empresas activas' },
        { value: '99.9%', label: 'Uptime' }
      ],
    },
    create: {
      slug: 'report',
      name: 'ReporT',
      badge: 'Suite Empresarial',
      tagline: 'Reportes y gestión sin límites',
      heroAccent: 'sin límites',
      description: 'ReporT es la plataforma empresarial de UnikLabs para generar reportes detallados, gestionar datos operacionales y mantener a tu equipo alineado.',
      accessAdminUrl: 'https://reportcms.uniklabs.tech/',
      accessUserUrl: 'https://report.uniklabs.tech/',
      accessInstructionsMd: [
        '# Bienvenido a ENT Reportes',
        '',
        'Tu suscripción fue activada correctamente.',
        '',
        '## Accesos',
        '- Admin: https://reportcms.uniklabs.tech/',
        '- App Técnico: https://report.uniklabs.tech/',
        '',
        '## Siguientes pasos',
        '1. Ingresa a la App Técnico con tu usuario operativo.',
        '2. Si recibiste credenciales de administración, inicia sesión en Admin para configuración.',
        '3. Si necesitas ayuda, responde a este correo y el equipo te apoyará.',
      ].join('\\n'),
      isActive: true,
      comingSoon: false,
      iconName: 'Building2',
      tags: ['Reportes', 'Dashboard', 'Multi-usuario'],
      stats: [
        { value: '500+', label: 'Reportes al mes' },
        { value: '40+', label: 'Empresas activas' },
        { value: '99.9%', label: 'Uptime' }
      ],
    }
  })

  // Si existía la app 'ent', migramos sus suscripciones a 'report' y luego la borramos
  const entApp = await prisma.app.findUnique({ where: { slug: 'ent' } })
  if (entApp) {
    console.log('Migrating subscriptions from ent to report...')
    await prisma.subscription.updateMany({
      where: { app_id: entApp.id },
      data: { app_id: reportApp.id }
    })
    
    console.log('Deleting old ent app data...')
    await prisma.appFAQ.deleteMany({ where: { appId: entApp.id } })
    await prisma.appPlan.deleteMany({ where: { appId: entApp.id } })
    await prisma.appFeature.deleteMany({ where: { appId: entApp.id } })
    await prisma.app.delete({ where: { id: entApp.id } })
  }

  // Actualizar features, plans y faqs para reportApp
  console.log('Updating ReporT features, plans and faqs...')
  await prisma.appFeature.deleteMany({ where: { appId: reportApp.id } })
  await prisma.appPlan.deleteMany({ where: { appId: reportApp.id } })
  await prisma.appFAQ.deleteMany({ where: { appId: reportApp.id } })

  await prisma.app.update({
    where: { id: reportApp.id },
    data: {
      features: {
        create: [
          {
            iconName: 'BarChart3',
            title: 'Reportes personalizados',
            description: 'Genera reportes a medida con filtros avanzados y exportación inmediata.',
            order: 0,
          },
          {
            iconName: 'Users',
            title: 'Gestión de equipos',
            description: 'Controla accesos y permisos para múltiples usuarios en tiempo real.',
            order: 1,
          },
          {
            iconName: 'Database',
            title: 'Base de datos centralizada',
            description: 'Almacena toda tu información operativa en un solo lugar seguro.',
            order: 2,
          },
          {
            iconName: 'Bell',
            title: 'Notificaciones inteligentes',
            description: 'Alertas automáticas sobre el estado de tus operaciones y reportes.',
            order: 3,
          },
          {
            iconName: 'Download',
            title: 'Exportación masiva',
            description: 'Descarga miles de registros en PDF o Excel con un solo clic.',
            order: 4,
          },
          {
            iconName: 'Shield',
            title: 'Seguridad empresarial',
            description: 'Encriptación de punta a punta y respaldos diarios automáticos.',
            order: 5,
          }
        ]
      },
      plans: {
        create: [
          {
            name: 'Starter',
            userRange: '1 – 4 usuarios',
            price: 29.00,
            description: 'Perfecto para equipos pequeños que están empezando.',
            isHighlighted: false,
            order: 0,
            features: [
              { text: 'Hasta 50 reportes/mes', included: true },
              { text: 'Soporte por email', included: true },
              { text: 'Dashboard básico', included: true },
              { text: 'Exportación PDF', included: false }
            ]
          },
          {
            name: 'Team',
            userRange: '5 – 15 usuarios',
            price: 69.00,
            description: 'Para equipos en crecimiento que necesitan más control.',
            isHighlighted: false,
            order: 1,
            features: [
              { text: 'Reportes ilimitados', included: true },
              { text: 'Soporte prioritario', included: true },
              { text: 'Exportación masiva', included: true },
              { text: 'API Access', included: false }
            ]
          },
          {
            name: 'Business',
            userRange: '16 – 50 usuarios',
            price: 109.00,
            description: 'Potencia total para empresas con operaciones complejas.',
            isHighlighted: true,
            order: 2,
            features: [
              { text: 'Todo lo de Team', included: true },
              { text: 'Roles personalizados', included: true },
              { text: 'Dashboard avanzado', included: true },
              { text: 'API Access', included: true }
            ]
          },
          {
            name: 'Enterprise',
            userRange: 'Sin límite',
            price: 249.00,
            description: 'Solución a medida para grandes corporaciones.',
            isHighlighted: false,
            order: 3,
            features: [
              { text: 'Todo lo de Business', included: true },
              { text: 'Soporte 24/7 dedicado', included: true },
              { text: 'Infraestructura propia', included: true },
              { text: 'SLA garantizado', included: true }
            ]
          }
        ]
      },
      faqs: {
        create: [
          {
            question: '¿Puedo cambiar de plan en cualquier momento?',
            answer: 'Sí, puedes subir o bajar de nivel según las necesidades de tu empresa desde el panel de facturación.',
            order: 0,
          },
          {
            question: '¿Qué tipo de soporte ofrecen?',
            answer: 'Ofrecemos desde soporte por email en el plan Starter hasta soporte 24/7 dedicado en el plan Enterprise.',
            order: 1,
          },
          {
            question: '¿Cómo se maneja la seguridad de mis datos?',
            answer: 'Toda la información está encriptada y realizamos respaldos automáticos cada 24 horas.',
            order: 2,
          },
          {
            question: '¿Hay un límite de reportes?',
            answer: 'Solo el plan Starter tiene un límite de 50 reportes mensuales. A partir del plan Team son ilimitados.',
            order: 3,
          },
          {
            question: '¿Ofrecen descuentos por pago anual?',
            answer: 'Sí, al elegir el pago anual recibes un descuento equivalente a 2 meses gratis.',
            order: 4,
          }
        ]
      }
    }
  })

  console.log(`Seeded app with slug: ${reportApp.slug}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
