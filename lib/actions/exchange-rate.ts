"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function setExchangeRate(data: {
  sellRate: number
  buyRate?: number
  notes?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  // Desactivar tasas anteriores
  await db.exchangeRate.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  })

  // Crear nueva tasa
  const rate = await db.exchangeRate.create({
    data: {
      sellRate: data.sellRate,
      buyRate: data.buyRate,
      setById: session.user.id,
      notes: data.notes,
      isActive: true,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/exchange-rate")

  return rate
}

export async function getCurrentExchangeRate() {
  return db.exchangeRate.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { setBy: true },
  })
}

export async function getExchangeRateHistory(limit: number = 20) {
  return db.exchangeRate.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { setBy: true },
  })
}
