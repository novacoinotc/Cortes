"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getToday } from "@/lib/utils"

export async function createOrUpdateDailyCut(data: {
  operatorId: string
  date?: Date
  endingBalanceMXN: number
  endingBalanceUSDT: number
  totalSalesMXN: number
  totalSalesUSDT: number
  notes?: string
}) {
  const date = data.date || getToday()

  const operator = await db.operator.findUnique({
    where: { id: data.operatorId },
  })

  if (!operator) {
    throw new Error("Operador no encontrado")
  }

  // Buscar corte existente para hoy
  const existingCut = await db.dailyCut.findUnique({
    where: {
      operatorId_date: {
        operatorId: data.operatorId,
        date,
      },
    },
  })

  // Obtener recargas del dia
  const todayRecharges = await db.rechargeRequest.findMany({
    where: {
      operatorId: data.operatorId,
      status: "APPROVED",
      approvedAt: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  })

  const totalRechargesMXN = todayRecharges.reduce(
    (sum, r) => sum + Number(r.amountMXN || 0),
    0
  )
  const totalRechargesUSDT = todayRecharges.reduce(
    (sum, r) => sum + Number(r.amountUSDT),
    0
  )

  // Calcular utilidad
  // La utilidad es lo que queda por encima del fondo asignado
  const calculatedProfitMXN = data.endingBalanceMXN - Number(operator.assignedFundMXN)

  const cutData = {
    startingBalanceMXN: existingCut?.startingBalanceMXN || operator.balanceMXN,
    startingBalanceUSDT: existingCut?.startingBalanceUSDT || operator.balanceUSDT,
    endingBalanceMXN: data.endingBalanceMXN,
    endingBalanceUSDT: data.endingBalanceUSDT,
    totalSalesMXN: data.totalSalesMXN,
    totalSalesUSDT: data.totalSalesUSDT,
    totalRechargesMXN,
    totalRechargesUSDT,
    calculatedProfitMXN,
    notes: data.notes,
    status: "PENDING_REVIEW" as const,
  }

  let cut
  if (existingCut) {
    cut = await db.dailyCut.update({
      where: { id: existingCut.id },
      data: cutData,
    })
  } else {
    cut = await db.dailyCut.create({
      data: {
        operatorId: data.operatorId,
        date,
        ...cutData,
      },
    })
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/cuts")
  revalidatePath("/dashboard/my-cuts")

  return cut
}

export async function approveDailyCut(cutId: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  const cut = await db.dailyCut.findUnique({
    where: { id: cutId },
    include: { operator: true },
  })

  if (!cut) {
    throw new Error("Corte no encontrado")
  }

  // Aprobar corte
  await db.dailyCut.update({
    where: { id: cutId },
    data: {
      status: "APPROVED",
    },
  })

  // Actualizar balance del operador
  await db.operator.update({
    where: { id: cut.operatorId },
    data: {
      balanceMXN: cut.endingBalanceMXN,
      balanceUSDT: cut.endingBalanceUSDT,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/cuts")
  revalidatePath("/dashboard/my-cuts")

  return { success: true }
}

export async function rejectDailyCut(cutId: string, notes?: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  await db.dailyCut.update({
    where: { id: cutId },
    data: {
      status: "REJECTED",
      notes,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/cuts")
  revalidatePath("/dashboard/my-cuts")

  return { success: true }
}

export async function registerProfitTransfer(
  cutId: string,
  amount: number,
  proofUrl?: string
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("No autorizado")
  }

  const cut = await db.dailyCut.findUnique({
    where: { id: cutId },
  })

  if (!cut) {
    throw new Error("Corte no encontrado")
  }

  // Actualizar corte con la transferencia de utilidad
  await db.dailyCut.update({
    where: { id: cutId },
    data: {
      profitTransferred: amount,
      profitProofUrl: proofUrl,
    },
  })

  // Descontar del balance del operador
  await db.operator.update({
    where: { id: cut.operatorId },
    data: {
      balanceMXN: {
        decrement: amount,
      },
    },
  })

  // Registrar transaccion
  await db.transaction.create({
    data: {
      operatorId: cut.operatorId,
      type: "PROFIT_WITHDRAWAL",
      amountMXN: -amount,
      dailyCutId: cutId,
      description: `Transferencia de utilidades del ${cut.date.toLocaleDateString()}`,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/cuts")
  revalidatePath("/dashboard/my-cuts")

  return { success: true }
}

export async function getDailyCuts(operatorId?: string) {
  return db.dailyCut.findMany({
    where: operatorId ? { operatorId } : undefined,
    include: {
      operator: {
        include: { user: true },
      },
    },
    orderBy: { date: "desc" },
  })
}

export async function getTodayCut(operatorId: string) {
  const today = getToday()
  return db.dailyCut.findUnique({
    where: {
      operatorId_date: {
        operatorId,
        date: today,
      },
    },
  })
}

export async function getPendingCuts() {
  return db.dailyCut.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      operator: {
        include: { user: true },
      },
    },
    orderBy: { date: "desc" },
  })
}
