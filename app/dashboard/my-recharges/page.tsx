export const dynamic = 'force-dynamic'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getRechargeRequests } from "@/lib/actions/recharges"
import { getCurrentExchangeRate } from "@/lib/actions/exchange-rate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import Link from "next/link"
import { Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
}

const statusVariants: Record<string, "default" | "success" | "destructive" | "secondary" | "warning"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
}

export default async function MyRechargesPage() {
  const session = await getServerSession(authOptions)
  const [recharges, currentRate] = await Promise.all([
    getRechargeRequests(session?.user.operatorId!),
    getCurrentExchangeRate(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Recargas</h1>
          <p className="text-muted-foreground">
            Solicita recargas de USDT para operar
          </p>
        </div>
        <Link href="/dashboard/my-recharges/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Recarga
          </Button>
        </Link>
      </div>

      {currentRate && (
        <div className="rounded-xl bg-pink-500/10 border border-pink-500/20 p-4">
          <p className="text-pink-300">
            <span className="font-medium">Tipo de cambio actual:</span> $
            {Number(currentRate.sellRate).toFixed(2)} MXN por USDT
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Recargas</CardTitle>
        </CardHeader>
        <CardContent>
          {recharges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tienes solicitudes de recarga
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">USDT Solicitado</TableHead>
                  <TableHead className="text-right">Costo MXN</TableHead>
                  <TableHead className="text-right">TC</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recharges.map((recharge) => (
                  <TableRow key={recharge.id}>
                    <TableCell>{formatDateTime(recharge.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(recharge.amountUSDT), "USDT")}
                    </TableCell>
                    <TableCell className="text-right">
                      {recharge.amountMXN
                        ? formatCurrency(Number(recharge.amountMXN))
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
                    <TableCell className="max-w-xs truncate">
                      {recharge.notes || "-"}
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
