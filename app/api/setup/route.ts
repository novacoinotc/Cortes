import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hash } from "bcryptjs"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verificar si ya existe un admin
  const existingAdmin = await db.user.findFirst({
    where: { role: "ADMIN" }
  })

  if (existingAdmin) {
    return NextResponse.json({
      success: false,
      message: "El sistema ya fue inicializado. Admin existente.",
      admin: existingAdmin.email
    })
  }

  try {
    // Crear usuario admin
    const adminPassword = await hash("admin123", 12)
    const admin = await db.user.create({
      data: {
        email: "admin@otc.com",
        name: "Administrador",
        password: adminPassword,
        role: "ADMIN",
      },
    })

    // Crear operador de ejemplo (Andy)
    const operatorPassword = await hash("operator123", 12)
    const operator = await db.user.create({
      data: {
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

    // Crear tipo de cambio inicial
    const rate = await db.exchangeRate.create({
      data: {
        sellRate: 17.50,
        buyRate: 17.20,
        setById: admin.id,
        isActive: true,
        notes: "Tipo de cambio inicial",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Sistema inicializado correctamente",
      data: {
        admin: {
          email: admin.email,
          password: "admin123"
        },
        operator: {
          email: operator.email,
          password: "operator123",
          fund: "1,000,000 MXN"
        },
        exchangeRate: {
          sell: 17.50,
          buy: 17.20
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
