export const dynamic = 'force-dynamic'

import { getRechargeRequests, getPendingRecharges } from "@/lib/actions/recharges"
import { getCurrentExchangeRate } from "@/lib/actions/exchange-rate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RechargeActions } from "@/components/recharges/recharge-actions"

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  COMPLETED: "Completada",
}

const statusVariants: Record<string, "default" | "success" | "destructive" | "secondary" | "warning"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  COMPLETED: "success",
}

export default async function RechargesPage() {
  const [allRecharges, pendingRecharges, currentRate] = await Promise.all([
    getRechargeRequests(),
    getPendingRecharges(),
    getCurrentExchangeRate(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Solicitudes de Recarga</h1>
        <p className="text-muted-foreground">
          Gestiona las solicitudes de recarga de USDT de los operadores
        </p>
      </div>

      {currentRate && (
        <div className="rounded-xl bg-pink-500/10 border border-pink-500/20 p-4">
          <p className="text-pink-300">
            <span className="font-medium">Tipo de cambio actual:</span> $
            {Number(currentRate.sellRate).toFixed(2)} MXN por USDT
          </p>
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pendientes ({pendingRecharges.length})
          </TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRecharges.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay solicitudes pendientes
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead className="text-right">MXN a Pagar</TableHead>
                      <TableHead className="text-right">USDT Estimado (TC actual)</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRecharges.map((recharge) => (
                      <TableRow key={recharge.id}>
                        <TableCell>{formatDateTime(recharge.createdAt)}</TableCell>
                        <TableCell className="font-medium">
                          {recharge.operator.user.name}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(recharge.amountMXN))}
                        </TableCell>
                        <TableCell className="text-right">
                          {currentRate
                            ? formatCurrency(
                                Number(recharge.amountMXN) / Number(currentRate.sellRate),
                                "USDT"
                              )
                            : "Sin TC"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {recharge.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <RechargeActions
                            rechargeId={recharge.id}
                            amountMXN={Number(recharge.amountMXN)}
                            currentRate={currentRate ? Number(currentRate.sellRate) : undefined}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Solicitudes</CardTitle>
            </CardHeader>
            <CardContent>
              {allRecharges.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay solicitudes
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead className="text-right">MXN Pagado</TableHead>
                      <TableHead className="text-right">USDT Recibido</TableHead>
                      <TableHead className="text-right">TC</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRecharges.map((recharge) => (
                      <TableRow key={recharge.id}>
                        <TableCell>{formatDateTime(recharge.createdAt)}</TableCell>
                        <TableCell className="font-medium">
                          {recharge.operator.user.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(recharge.amountMXN))}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(recharge.amountUSDT) > 0
                            ? formatCurrency(Number(recharge.amountUSDT), "USDT")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {recharge.exchangeRate
                            ? `$${Number(recharge.exchangeRate).toFixed(2)}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[recharge.status]}>
                            {statusLabels[recharge.status]}
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
