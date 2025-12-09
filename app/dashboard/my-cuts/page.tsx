export const dynamic = 'force-dynamic'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDailyCuts } from "@/lib/actions/cuts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
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
  DRAFT: "Borrador",
  PENDING_REVIEW: "En Revision",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
}

const statusVariants: Record<string, "default" | "success" | "destructive" | "secondary" | "warning"> = {
  DRAFT: "secondary",
  PENDING_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
}

export default async function MyCutsPage() {
  const session = await getServerSession(authOptions)
  const cuts = await getDailyCuts(session?.user.operatorId!)

  const totalProfit = cuts
    .filter((c) => c.status === "APPROVED")
    .reduce((sum, cut) => sum + Number(cut.calculatedProfitMXN), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Cortes</h1>
          <p className="text-muted-foreground">
            Realiza y consulta tus cortes diarios
          </p>
        </div>
        <Link href="/dashboard/my-cuts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Corte
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Utilidades Totales (Aprobadas)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(totalProfit)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Cortes</CardTitle>
        </CardHeader>
        <CardContent>
          {cuts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tienes cortes registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Ventas MXN</TableHead>
                  <TableHead className="text-right">Balance Final</TableHead>
                  <TableHead className="text-right">Utilidad</TableHead>
                  <TableHead className="text-right">Transferido</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuts.map((cut) => (
                  <TableRow key={cut.id}>
                    <TableCell>{formatDate(cut.date)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(cut.totalSalesMXN))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(cut.endingBalanceMXN))}
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      {formatCurrency(Number(cut.calculatedProfitMXN))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(cut.profitTransferred))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[cut.status]}>
                        {statusLabels[cut.status]}
                      </Badge>
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
