export const dynamic = 'force-dynamic'

import { getOperator } from "@/lib/actions/operators"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const transactionTypeLabels: Record<string, string> = {
  RECHARGE_USDT: "Recarga USDT",
  SALE_P2P: "Venta P2P",
  PAYMENT_TO_ADMIN: "Pago a Admin",
  LOAN_RECEIVED: "Prestamo Recibido",
  LOAN_PAYMENT: "Pago Prestamo",
  PROFIT_WITHDRAWAL: "Retiro Utilidad",
  ADJUSTMENT: "Ajuste",
}

export default async function OperatorDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const operator = await getOperator(params.id)

  if (!operator) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/operators">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{operator.user.name}</h1>
          <p className="text-muted-foreground">{operator.user.email}</p>
        </div>
        <Badge variant={operator.isActive ? "success" : "secondary"} className="text-sm">
          {operator.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Saldos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fondo Asignado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(operator.assignedFundMXN))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance MXN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(operator.balanceMXN))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance USDT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(operator.balanceUSDT), "USDT")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Diferencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              Number(operator.balanceMXN) > Number(operator.assignedFundMXN)
                ? "text-green-600"
                : Number(operator.balanceMXN) < Number(operator.assignedFundMXN)
                ? "text-red-600"
                : ""
            }`}>
              {formatCurrency(
                Number(operator.balanceMXN) - Number(operator.assignedFundMXN)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="cuts">Cortes</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Ultimas Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              {operator.transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay transacciones
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">MXN</TableHead>
                      <TableHead className="text-right">USDT</TableHead>
                      <TableHead>Descripcion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operator.transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {transactionTypeLabels[tx.type] || tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right ${
                          Number(tx.amountMXN) > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {tx.amountMXN ? formatCurrency(Number(tx.amountMXN)) : "-"}
                        </TableCell>
                        <TableCell className={`text-right ${
                          Number(tx.amountUSDT) > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {tx.amountUSDT
                            ? formatCurrency(Number(tx.amountUSDT), "USDT")
                            : "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {tx.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cuts">
          <Card>
            <CardHeader>
              <CardTitle>Ultimos Cortes</CardTitle>
            </CardHeader>
            <CardContent>
              {operator.dailyCuts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay cortes
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Ventas MXN</TableHead>
                      <TableHead className="text-right">Utilidad</TableHead>
                      <TableHead className="text-right">Transferido</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operator.dailyCuts.map((cut) => (
                      <TableRow key={cut.id}>
                        <TableCell>
                          {new Date(cut.date).toLocaleDateString("es-MX")}
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
                        <TableCell>
                          <Badge
                            variant={
                              cut.status === "APPROVED"
                                ? "success"
                                : cut.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {cut.status === "APPROVED"
                              ? "Aprobado"
                              : cut.status === "REJECTED"
                              ? "Rechazado"
                              : cut.status === "PENDING_REVIEW"
                              ? "Pendiente"
                              : "Borrador"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
