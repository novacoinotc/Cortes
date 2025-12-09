"use server"

import { db } from "@/lib/db"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createOperator(data: {
  name: string
  email: string
  password: string
  assignedFundMXN: number
}) {
  const hashedPassword = await hash(data.password, 12)

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "OPERATOR",
      operator: {
        create: {
          assignedFundMXN: data.assignedFundMXN,
          balanceMXN: data.assignedFundMXN,
          balanceUSDT: 0,
        },
      },
    },
    include: { operator: true },
  })

  revalidatePath("/dashboard/operators")
  return user
}

export async function updateOperator(
  operatorId: string,
  data: {
    name?: string
    email?: string
    assignedFundMXN?: number
    isActive?: boolean
  }
) {
  const operator = await db.operator.findUnique({
    where: { id: operatorId },
    include: { user: true },
  })

  if (!operator) {
    throw new Error("Operador no encontrado")
  }

  // Actualizar usuario
  if (data.name || data.email) {
    await db.user.update({
      where: { id: operator.userId },
      data: {
        name: data.name,
        email: data.email,
      },
    })
  }

  // Actualizar operador
  if (data.assignedFundMXN !== undefined || data.isActive !== undefined) {
    await db.operator.update({
      where: { id: operatorId },
      data: {
        assignedFundMXN: data.assignedFundMXN,
        isActive: data.isActive,
      },
    })
  }

  revalidatePath("/dashboard/operators")
  return { success: true }
}

export async function getOperators() {
  return db.operator.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function getOperator(id: string) {
  return db.operator.findUnique({
    where: { id },
    include: {
      user: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      dailyCuts: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  })
}

export async function updateOperatorBalance(
  operatorId: string,
  balanceMXN?: number,
  balanceUSDT?: number
) {
  await db.operator.update({
    where: { id: operatorId },
    data: {
      ...(balanceMXN !== undefined && { balanceMXN }),
      ...(balanceUSDT !== undefined && { balanceUSDT }),
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/operators")
}
