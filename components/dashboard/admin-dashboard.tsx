import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import {
  Users,
  ArrowUpDown,
  Wallet,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import { getToday } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getStats() {
  const today = getToday()

  const [
    operatorsCount,
    pendingRecharges,
    activeLoans,
    todayCuts,
    currentRate,
    operators,
  ] = await Promise.all([
    db.operator.count({ where: { isActive: true } }),
    db.rechargeRequest.count({ where: { status: "PENDING" } }),
    db.loan.count({ where: { status: "ACTIVE" } }),
    db.dailyCut.count({ where: { date: today } }),
    db.exchangeRate.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
    db.operator.findMany({
      where: { isActive: true },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  // Calcular totales
  const totalFunds = operators.reduce(
    (sum, op) => sum + Number(op.assignedFundMXN),
    0
  )
  const totalBalanceMXN = operators.reduce(
    (sum, op) => sum + Number(op.balanceMXN),
    0
  )
  const totalBalanceUSDT = operators.reduce(
    (sum, op) => sum + Number(op.balanceUSDT),
    0
  )

  return {
    operatorsCount,
    pendingRecharges,
    activeLoans,
    todayCuts,
    currentRate: currentRate?.sellRate ? Number(currentRate.sellRate) : null,
    totalFunds,
    totalBalanceMXN,
    totalBalanceUSDT,
    operators,
  }
}

export async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al panel de administracion
        </p>
      </div>

      {/* Alertas */}
      {(stats.pendingRecharges > 0 || stats.activeLoans > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Acciones pendientes:</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-yellow-700">
            {stats.pendingRecharges > 0 && (
              <li>
                <Link href="/dashboard/recharges" className="underline">
                  {stats.pendingRecharges} solicitudes de recarga pendientes
                </Link>
              </li>
            )}
            {stats.activeLoans > 0 && (
              <li>
                <Link href="/dashboard/loans" className="underline">
                  {stats.activeLoans} prestamos activos
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operadores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.operatorsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recargas Pendientes</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRecharges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prestamos Activos</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tipo de Cambio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.currentRate ? `$${stats.currentRate.toFixed(2)}` : "No definido"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Totales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fondos Asignados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalFunds)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance MXN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalBalanceMXN)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Balance USDT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalBalanceUSDT, "USDT")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operadores */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Operadores</CardTitle>
          <Link href="/dashboard/operators">
            <Button variant="outline" size="sm">Ver todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.operators.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay operadores registrados
              </p>
            ) : (
              stats.operators.slice(0, 5).map((operator) => (
                <div
                  key={operator.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{operator.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Fondo: {formatCurrency(Number(operator.assignedFundMXN))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(Number(operator.balanceMXN))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(Number(operator.balanceUSDT), "USDT")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
