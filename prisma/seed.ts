import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const branches = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
  ];
  const degrees = ["B.Tech", "M.Tech", "MBA", "MCA", "BBA"];

  for (const name of branches) {
    await prisma.branch.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const degree of degrees) {
    await prisma.degree.upsert({
      where: { name: degree },
      update: {},
      create: { name: degree },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
