import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const operator = await db.operator.findUnique({
      where: { id: params.id },
    })

    if (!operator) {
      return NextResponse.json(
        { error: "Operador no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      assignedFundMXN: Number(operator.assignedFundMXN),
      balanceMXN: Number(operator.balanceMXN),
      balanceUSDT: Number(operator.balanceUSDT),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener datos" },
      { status: 500 }
    )
  }
}
