import { getLoans, getActiveLoans } from "@/lib/actions/loans"
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
import { LoanActions } from "@/components/loans/loan-actions"

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

export default async function LoansPage() {
  const [allLoans, activeLoans] = await Promise.all([
    getLoans(),
    getActiveLoans(),
  ])

  const totalActive = activeLoans.reduce(
    (sum, loan) => sum + Number(loan.amountMXN || 0),
    0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prestamos</h1>
        <p className="text-muted-foreground">
          Gestiona los prestamos a los operadores
        </p>
      </div>

      {activeLoans.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <span className="font-medium">Prestamos activos:</span>{" "}
            {activeLoans.length} prestamos por un total de{" "}
            {formatCurrency(totalActive)}
          </p>
        </div>
      )}

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Activos ({activeLoans.length})
          </TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Prestamos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              {activeLoans.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay prestamos activos
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead className="text-right">Monto MXN</TableHead>
                      <TableHead className="text-right">Monto USDT</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{formatDateTime(loan.createdAt)}</TableCell>
                        <TableCell className="font-medium">
                          {loan.operator.user.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {loan.amountMXN
                            ? formatCurrency(Number(loan.amountMXN))
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {loan.amountUSDT
                            ? formatCurrency(Number(loan.amountUSDT), "USDT")
                            : "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {loan.reason}
                        </TableCell>
                        <TableCell className="text-right">
                          <LoanActions loanId={loan.id} />
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
              <CardTitle>Todos los Prestamos</CardTitle>
            </CardHeader>
            <CardContent>
              {allLoans.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay prestamos
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead className="text-right">Monto MXN</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Pagado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{formatDateTime(loan.createdAt)}</TableCell>
                        <TableCell className="font-medium">
                          {loan.operator.user.name}
                        </TableCell>
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
                          {loan.paidAt
                            ? formatDateTime(loan.paidAt)
                            : "-"}
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
