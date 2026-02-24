"use client"

import * as Icons from 'lucide-react'

export function DynamicIcon({ name, className }: { name: string, className?: string }) {
    const Icon = (Icons as any)[name]
    return Icon ? <Icon className={className} /> : null
}
