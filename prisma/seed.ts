import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Crear usuario admin
  const adminPassword = await hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@otc.com" },
    update: {},
    create: {
      email: "admin@otc.com",
      name: "Administrador",
      password: adminPassword,
      role: "ADMIN",
    },
  })
  console.log("Admin created:", admin.email)

  // Crear operador de ejemplo
  const operatorPassword = await hash("operator123", 12)
  const operator = await prisma.user.upsert({
    where: { email: "andy@otc.com" },
    update: {},
    create: {
      email: "andy@otc.com",
      name: "Andy",
      password: operatorPassword,
      role: "OPERATOR",
      operator: {
        create: {
          assignedFundMXN: 1000000,
          balanceMXN: 1000000,
          balanceUSDT: 0,
        },
      },
    },
  })
  console.log("Operator created:", operator.email)

  // Crear tipo de cambio inicial
  const rate = await prisma.exchangeRate.create({
    data: {
      sellRate: 17.50,
      buyRate: 17.20,
      setById: admin.id,
      isActive: true,
      notes: "Tipo de cambio inicial",
    },
  })
  console.log("Exchange rate created:", rate.sellRate)

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
