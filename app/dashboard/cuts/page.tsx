import { getDailyCuts, getPendingCuts } from "@/lib/actions/cuts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CutActions } from "@/components/cuts/cut-actions"

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
}

const statusVariants: Record<string, "default" | "success" | "destructive" | "secondary" | "warning"> = {
  DRAFT: "secondary",
  PENDING_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
}

export default async function CutsPage() {
  const [allCuts, pendingCuts] = await Promise.all([
    getDailyCuts(),
    getPendingCuts(),
  ])

  const totalPendingProfit = pendingCuts.reduce(
    (sum, cut) => sum + Number(cut.calculatedProfitMXN),
    0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cortes Diarios</h1>
        <p className="text-muted-foreground">
          Revisa y aprueba los cortes de los operadores
        </p>
      </div>

      {pendingCuts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <span className="font-medium">{pendingCuts.length} corte(s) pendiente(s)</span>{" "}
            con utilidades por {formatCurrency(totalPendingProfit)}
          </p>
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pendientes ({pendingCuts.length})
          </TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Cortes Pendientes de Revision</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingCuts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay cortes pendientes
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead className="text-right">Ventas MXN</TableHead>
                      <TableHead className="text-right">Balance Final MXN</TableHead>
                      <TableHead className="text-right">Utilidad</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCuts.map((cut) => (
                      <TableRow key={cut.id}>
                        <TableCell>{formatDate(cut.date)}</TableCell>
                        <TableCell className="font-medium">
                          {cut.operator.user.name}
                        </TableCell>
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
                          <CutActions cutId={cut.id} />
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
              <CardTitle>Todos los Cortes</CardTitle>
            </CardHeader>
            <CardContent>
              {allCuts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay cortes
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
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCuts.map((cut) => (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
