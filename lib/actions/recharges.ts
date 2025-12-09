"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function createRechargeRequest(data: {
  operatorId: string
  amountMXN: number
  notes?: string
}) {
  const request = await db.rechargeRequest.create({
    data: {
      operatorId: data.operatorId,
      amountMXN: data.amountMXN,
      amountUSDT: 0, // Se calculara cuando el admin apruebe
      notes: data.notes,
      status: "PENDING",
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/recharges")
  revalidatePath("/dashboard/my-recharges")

  return request
}

export async function approveRechargeRequest(
  requestId: string,
  exchangeRate: number
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  const request = await db.rechargeRequest.findUnique({
    where: { id: requestId },
    include: { operator: true },
  })

  if (!request) {
    throw new Error("Solicitud no encontrada")
  }

  // Calcular USDT basado en MXN y TC
  const amountMXN = Number(request.amountMXN)
  const amountUSDT = amountMXN / exchangeRate

  // Actualizar solicitud
  await db.rechargeRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      exchangeRate,
      amountUSDT,
      approvedById: session.user.id,
      approvedAt: new Date(),
    },
  })

  // Actualizar balance del operador
  // El operador paga MXN y recibe USDT
  await db.operator.update({
    where: { id: request.operatorId },
    data: {
      balanceUSDT: {
        increment: amountUSDT,
      },
      balanceMXN: {
        decrement: amountMXN,
      },
    },
  })

  // Crear transaccion
  await db.transaction.create({
    data: {
      operatorId: request.operatorId,
      type: "RECHARGE_USDT",
      amountUSDT: amountUSDT,
      amountMXN: -amountMXN,
      exchangeRate,
      rechargeId: requestId,
      description: `Recarga: Pago ${amountMXN.toLocaleString()} MXN, Recibe ${amountUSDT.toFixed(2)} USDT a TC $${exchangeRate}`,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/recharges")
  revalidatePath("/dashboard/my-recharges")

  return { success: true }
}

export async function rejectRechargeRequest(requestId: string, notes?: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  await db.rechargeRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      notes,
      approvedById: session.user.id,
      approvedAt: new Date(),
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/recharges")
  revalidatePath("/dashboard/my-recharges")

  return { success: true }
}

export async function getRechargeRequests(operatorId?: string) {
  return db.rechargeRequest.findMany({
    where: operatorId ? { operatorId } : undefined,
    include: {
      operator: {
        include: { user: true },
      },
      approvedBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getPendingRecharges() {
  return db.rechargeRequest.findMany({
    where: { status: "PENDING" },
    include: {
      operator: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}
