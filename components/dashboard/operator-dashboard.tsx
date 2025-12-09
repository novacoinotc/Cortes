import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { formatCurrency, formatDate, getToday } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  TrendingUp,
  ArrowUpDown,
  FileText,
  DollarSign,
} from "lucide-react"

async function getOperatorData(operatorId: string) {
  const today = getToday()

  const [operator, currentRate, pendingRecharges, activeLoans, todayCut, recentCuts] =
    await Promise.all([
      db.operator.findUnique({
        where: { id: operatorId },
        include: { user: true },
      }),
      db.exchangeRate.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      db.rechargeRequest.count({
        where: { operatorId, status: "PENDING" },
      }),
      db.loan.findMany({
        where: { operatorId, status: "ACTIVE" },
      }),
      db.dailyCut.findFirst({
        where: { operatorId, date: today },
      }),
      db.dailyCut.findMany({
        where: { operatorId, status: "APPROVED" },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ])

  const totalActiveLoans = activeLoans.reduce(
    (sum, loan) => sum + Number(loan.amountMXN || 0),
    0
  )

  return {
    operator,
    currentRate: currentRate?.sellRate ? Number(currentRate.sellRate) : null,
    pendingRecharges,
    activeLoans: activeLoans.length,
    totalActiveLoans,
    todayCut,
    recentCuts,
  }
}

export async function OperatorDashboard({ operatorId }: { operatorId: string }) {
  const data = await getOperatorData(operatorId)

  if (!data.operator) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Operador no encontrado</p>
      </div>
    )
  }

  const { operator, currentRate, pendingRecharges, activeLoans, totalActiveLoans, todayCut, recentCuts } = data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hola, {operator.user.name}</h1>
        <p className="text-muted-foreground">
          Tu panel de control personal
        </p>
      </div>

      {/* Saldos principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Saldo MXN
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(operator.balanceMXN))}
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Fondo asignado: {formatCurrency(Number(operator.assignedFundMXN))}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Saldo USDT
            </CardTitle>
            <Wallet className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(operator.balanceUSDT), "USDT")}
            </div>
            <p className="text-xs text-green-200 mt-1">
              TC: ${currentRate?.toFixed(2) || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prestamos Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {formatCurrency(totalActiveLoans)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recargas Pendientes</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRecharges}</div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rapidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/my-recharges/new">
          <Card className="cursor-pointer hover:bg-purple-500/10 transition-colors">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-cyan-500/20">
                <ArrowUpDown className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <p className="font-medium">Solicitar Recarga</p>
                <p className="text-sm text-purple-300/60">
                  Pide USDT al administrador
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/my-cuts/new">
          <Card className="cursor-pointer hover:bg-purple-500/10 transition-colors">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <FileText className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">Hacer Corte</p>
                <p className="text-sm text-purple-300/60">
                  {todayCut ? "Continuar corte de hoy" : "Iniciar corte del dia"}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/my-loans/new">
          <Card className="cursor-pointer hover:bg-purple-500/10 transition-colors">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 rounded-xl bg-pink-500/20">
                <Wallet className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <p className="font-medium">Solicitar Prestamo</p>
                <p className="text-sm text-purple-300/60">
                  Para ordenes mayores al fondo
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Ultimos cortes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ultimos Cortes Aprobados</CardTitle>
          <Link href="/dashboard/my-cuts">
            <Button variant="outline" size="sm">Ver todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentCuts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay cortes aprobados aun
            </p>
          ) : (
            <div className="space-y-3">
              {recentCuts.map((cut) => (
                <div
                  key={cut.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{formatDate(cut.date)}</p>
                    <p className="text-sm text-muted-foreground">
                      Ventas: {formatCurrency(Number(cut.totalSalesMXN))}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success">
                      +{formatCurrency(Number(cut.calculatedProfitMXN))}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
