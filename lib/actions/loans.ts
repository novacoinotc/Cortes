"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function createLoanRequest(data: {
  operatorId: string
  amountMXN?: number
  amountUSDT?: number
  reason: string
}) {
  const loan = await db.loan.create({
    data: {
      operatorId: data.operatorId,
      amountMXN: data.amountMXN,
      amountUSDT: data.amountUSDT,
      reason: data.reason,
      status: "ACTIVE",
    },
  })

  // Si el prestamo es en MXN, actualizar balance
  if (data.amountMXN) {
    await db.operator.update({
      where: { id: data.operatorId },
      data: {
        balanceMXN: {
          increment: data.amountMXN,
        },
      },
    })

    await db.transaction.create({
      data: {
        operatorId: data.operatorId,
        type: "LOAN_RECEIVED",
        amountMXN: data.amountMXN,
        loanId: loan.id,
        description: `Prestamo recibido: ${data.reason}`,
      },
    })
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/loans")
  revalidatePath("/dashboard/my-loans")

  return loan
}

export async function approveLoan(loanId: string, exchangeRate?: number) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("No autorizado")
  }

  const loan = await db.loan.findUnique({
    where: { id: loanId },
  })

  if (!loan) {
    throw new Error("Prestamo no encontrado")
  }

  await db.loan.update({
    where: { id: loanId },
    data: {
      status: "ACTIVE",
      approvedById: session.user.id,
      approvedAt: new Date(),
      exchangeRate,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/loans")
  revalidatePath("/dashboard/my-loans")

  return { success: true }
}

export async function payLoan(loanId: string) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("No autorizado")
  }

  const loan = await db.loan.findUnique({
    where: { id: loanId },
    include: { operator: true },
  })

  if (!loan) {
    throw new Error("Prestamo no encontrado")
  }

  // Marcar como pagado
  await db.loan.update({
    where: { id: loanId },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  })

  // Si el prestamo era en MXN, descontar del balance
  if (loan.amountMXN) {
    await db.operator.update({
      where: { id: loan.operatorId },
      data: {
        balanceMXN: {
          decrement: Number(loan.amountMXN),
        },
      },
    })

    await db.transaction.create({
      data: {
        operatorId: loan.operatorId,
        type: "LOAN_PAYMENT",
        amountMXN: -Number(loan.amountMXN),
        loanId: loanId,
        description: `Pago de prestamo`,
      },
    })
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/loans")
  revalidatePath("/dashboard/my-loans")

  return { success: true }
}

export async function getLoans(operatorId?: string) {
  return db.loan.findMany({
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

export async function getActiveLoans(operatorId?: string) {
  return db.loan.findMany({
    where: {
      status: "ACTIVE",
      ...(operatorId && { operatorId }),
    },
    include: {
      operator: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}
