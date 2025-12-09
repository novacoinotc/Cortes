import { getOperators } from "@/lib/actions/operators"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
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

export default async function OperatorsPage() {
  const operators = await getOperators()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operadores</h1>
          <p className="text-muted-foreground">
            Gestiona los operadores del sistema
          </p>
        </div>
        <Link href="/dashboard/operators/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Operador
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Operadores</CardTitle>
        </CardHeader>
        <CardContent>
          {operators.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay operadores registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Fondo Asignado</TableHead>
                  <TableHead className="text-right">Balance MXN</TableHead>
                  <TableHead className="text-right">Balance USDT</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operators.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell className="font-medium">
                      {operator.user.name}
                    </TableCell>
                    <TableCell>{operator.user.email}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(operator.assignedFundMXN))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(operator.balanceMXN))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(operator.balanceUSDT), "USDT")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={operator.isActive ? "success" : "secondary"}>
                        {operator.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/operators/${operator.id}`}>
                        <Button variant="outline" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
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
