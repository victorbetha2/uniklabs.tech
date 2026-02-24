"use client";

const stats = [
    { value: "3+", label: "Apps disponibles" },
    { value: "100+", label: "Empresas activas" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Soporte" },
];

export default function StatsBar() {
    return (
        <div className="w-full bg-zinc-900/50 border-y border-zinc-800 backdrop-blur-sm">
            <div className="container mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-zinc-800 md:divide-x border-zinc-800">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="px-8 py-10 flex flex-col items-center justify-center text-center space-y-1"
                        >
                            <span className="text-3xl font-black text-white tracking-tight">
                                {stat.value}
                            </span>
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
