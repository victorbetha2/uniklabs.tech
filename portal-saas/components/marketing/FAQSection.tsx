"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "¿Qué es UnikLabs?",
        answer: "UnikLabs es una empresa de software que desarrolla aplicaciones SaaS para empresas. Nuestro portal centraliza el acceso y la gestión de todas nuestras apps desde un solo lugar.",
    },
    {
        question: "¿Cómo funciona la suscripción?",
        answer: "Cada app tiene sus propios planes por cantidad de usuarios. Pagas directamente por la app que necesitas, con suscripción mensual vía PayPal. Puedes cancelar cuando quieras sin penalizaciones.",
    },
    {
        question: "¿Puedo usar varias apps con el mismo login?",
        answer: "Sí. Un solo registro en UnikLabs te da acceso a todas las apps activas en tu cuenta.",
    },
    {
        question: "¿Tienen soporte técnico?",
        answer: "Sí, ofrecemos soporte por email para todos los planes y soporte prioritario en planes empresariales.",
    },
    {
        question: "¿Es seguro pagar con PayPal?",
        answer: "Totalmente. Procesamos todos los pagos a través de PayPal con sus estándares de seguridad certificados.",
    },
    {
        question: "¿Puedo cambiar de plan?",
        answer: "Sí, puedes upgradear o downgradear tu plan en cualquier momento desde tu dashboard.",
    },
];

export default function FAQSection() {
    return (
        <section id="faq" className="py-24 md:py-32 bg-black border-t border-zinc-900">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-16 text-center tracking-tight">
                    Preguntas frecuentes
                </h2>

                <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border border-zinc-800 bg-zinc-900/50 rounded-2xl px-6"
                        >
                            <AccordionTrigger className="text-left text-white hover:text-lime-400 font-bold py-6 hover:no-underline transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-400 text-lg leading-relaxed pb-6">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
