export const dynamic = 'force-dynamic'

import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TrendingUp, Users, DollarSign, ArrowUpDown } from "lucide-react"

async function getReportData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    operators,
    thisMonthCuts,
    lastMonthCuts,
    thisMonthRecharges,
    activeLoans,
  ] = await Promise.all([
    db.operator.findMany({
      where: { isActive: true },
      include: { user: true },
    }),
    db.dailyCut.findMany({
      where: {
        status: "APPROVED",
        date: { gte: startOfMonth },
      },
      include: {
        operator: { include: { user: true } },
      },
    }),
    db.dailyCut.findMany({
      where: {
        status: "APPROVED",
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    db.rechargeRequest.findMany({
      where: {
        status: "APPROVED",
        approvedAt: { gte: startOfMonth },
      },
    }),
    db.loan.findMany({
      where: { status: "ACTIVE" },
    }),
  ])

  // Calcular totales del mes
  const thisMonthProfit = thisMonthCuts.reduce(
    (sum, cut) => sum + Number(cut.calculatedProfitMXN),
    0
  )
  const thisMonthSales = thisMonthCuts.reduce(
    (sum, cut) => sum + Number(cut.totalSalesMXN),
    0
  )
  const lastMonthProfit = lastMonthCuts.reduce(
    (sum, cut) => sum + Number(cut.calculatedProfitMXN),
    0
  )

  const thisMonthRechargesTotal = thisMonthRecharges.reduce(
    (sum, r) => sum + Number(r.amountUSDT),
    0
  )

  const activeLoansTotal = activeLoans.reduce(
    (sum, l) => sum + Number(l.amountMXN || 0),
    0
  )

  // Agrupar por operador
  const profitByOperator = thisMonthCuts.reduce((acc, cut) => {
    const name = cut.operator.user.name
    if (!acc[name]) {
      acc[name] = { profit: 0, sales: 0, cuts: 0 }
    }
    acc[name].profit += Number(cut.calculatedProfitMXN)
    acc[name].sales += Number(cut.totalSalesMXN)
    acc[name].cuts += 1
    return acc
  }, {} as Record<string, { profit: number; sales: number; cuts: number }>)

  return {
    operators,
    thisMonthProfit,
    thisMonthSales,
    lastMonthProfit,
    thisMonthRechargesTotal,
    activeLoansTotal,
    profitByOperator,
    thisMonthCuts,
  }
}

export default async function ReportsPage() {
  const data = await getReportData()

  const profitChange = data.lastMonthProfit > 0
    ? ((data.thisMonthProfit - data.lastMonthProfit) / data.lastMonthProfit) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">
          Analiza el rendimiento del negocio
        </p>
      </div>

      {/* Resumen del mes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Utilidad del Mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.thisMonthProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profitChange >= 0 ? "+" : ""}{profitChange.toFixed(1)}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas del Mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.thisMonthSales)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              USDT Vendido
            </CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.thisMonthRechargesTotal, "USDT")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Prestamos Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.activeLoansTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento por operador */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Operador (Este Mes)</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(data.profitByOperator).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay datos este mes
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operador</TableHead>
                  <TableHead className="text-right">Cortes</TableHead>
                  <TableHead className="text-right">Ventas MXN</TableHead>
                  <TableHead className="text-right">Utilidad</TableHead>
                  <TableHead className="text-right">% del Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.profitByOperator)
                  .sort((a, b) => b[1].profit - a[1].profit)
                  .map(([name, stats]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-right">{stats.cuts}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(stats.sales)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(stats.profit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {data.thisMonthProfit > 0
                          ? ((stats.profit / data.thisMonthProfit) * 100).toFixed(1)
                          : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                <TableRow className="bg-gray-50 font-bold">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right">
                    {Object.values(data.profitByOperator).reduce((s, o) => s + o.cuts, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(data.thisMonthSales)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(data.thisMonthProfit)}
                  </TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ultimos cortes */}
      <Card>
        <CardHeader>
          <CardTitle>Ultimos Cortes Aprobados</CardTitle>
        </CardHeader>
        <CardContent>
          {data.thisMonthCuts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay cortes aprobados este mes
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead className="text-right">Ventas MXN</TableHead>
                  <TableHead className="text-right">Utilidad</TableHead>
                  <TableHead className="text-right">Transferido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.thisMonthCuts
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((cut) => (
                    <TableRow key={cut.id}>
                      <TableCell>{formatDate(cut.date)}</TableCell>
                      <TableCell className="font-medium">
                        {cut.operator.user.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(cut.totalSalesMXN))}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(Number(cut.calculatedProfitMXN))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(cut.profitTransferred))}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
