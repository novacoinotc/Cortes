export const dynamic = 'force-dynamic'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getLoans } from "@/lib/actions/loans"
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
  ACTIVE: "Activo",
  PAID: "Pagado",
  CANCELLED: "Cancelado",
}

const statusVariants: Record<string, "default" | "success" | "destructive" | "secondary" | "warning"> = {
  ACTIVE: "warning",
  PAID: "success",
  CANCELLED: "secondary",
}

export default async function MyLoansPage() {
  const session = await getServerSession(authOptions)
  const loans = await getLoans(session?.user.operatorId!)

  const activeLoans = loans.filter((l) => l.status === "ACTIVE")
  const totalActive = activeLoans.reduce(
    (sum, loan) => sum + Number(loan.amountMXN || 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Prestamos</h1>
          <p className="text-muted-foreground">
            Solicita prestamos cuando necesites mas fondo
          </p>
        </div>
        <Link href="/dashboard/my-loans/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Solicitar Prestamo
          </Button>
        </Link>
      </div>

      {activeLoans.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <span className="font-medium">Tienes {activeLoans.length} prestamo(s) activo(s)</span>{" "}
            por un total de {formatCurrency(totalActive)}
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Prestamos</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tienes prestamos
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto MXN</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pagado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{formatDateTime(loan.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {loan.amountMXN
                        ? formatCurrency(Number(loan.amountMXN))
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {loan.reason}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[loan.status]}>
                        {statusLabels[loan.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {loan.paidAt ? formatDateTime(loan.paidAt) : "-"}
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
