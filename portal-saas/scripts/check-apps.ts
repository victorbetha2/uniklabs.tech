import { prisma } from '../lib/prisma';

async function main() {
    const apps = await prisma.app.findMany({
        include: {
            plans: true,
        },
    });
    console.log(JSON.stringify(apps, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // await prisma.$disconnect(); // It's a proxy, might not have $disconnect directly available if not initialized
    });
