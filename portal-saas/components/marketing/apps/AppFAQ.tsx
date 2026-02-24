"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQ {
    id: string
    question: string
    answer: string
}

interface AppFAQProps {
    appName: string
    faqs: FAQ[]
}

export function AppFAQ({ appName, faqs }: AppFAQProps) {
    if (!faqs || faqs.length === 0) return null

    return (
        <section className="py-24 bg-black">
            <div className="container px-4 mx-auto max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Preguntas sobre {appName}
                    </h2>
                    <div className="h-1 w-20 bg-lime-500 mx-auto rounded-full" />
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq) => (
                        <AccordionItem
                            key={faq.id}
                            value={faq.id}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 overflow-hidden"
                        >
                            <AccordionTrigger className="text-left text-white hover:text-lime-400 hover:no-underline py-6">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-400 pb-6 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
