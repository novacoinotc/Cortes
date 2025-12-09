import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const transactionTypeLabels: Record<string, string> = {
  RECHARGE_USDT: "Recarga USDT",
  SALE_P2P: "Venta P2P",
  PAYMENT_TO_ADMIN: "Pago a Admin",
  LOAN_RECEIVED: "Prestamo",
  LOAN_PAYMENT: "Pago Prestamo",
  PROFIT_WITHDRAWAL: "Retiro Utilidad",
  ADJUSTMENT: "Ajuste",
}

async function getOperatorHistory(operatorId: string) {
  const transactions = await db.transaction.findMany({
    where: { operatorId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return transactions
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  const transactions = await getOperatorHistory(session?.user.operatorId!)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial</h1>
        <p className="text-muted-foreground">
          Todas tus transacciones y movimientos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ultimas Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
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
                  <TableHead className="text-right">TC</TableHead>
                  <TableHead>Descripcion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transactionTypeLabels[tx.type] || tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      Number(tx.amountMXN) > 0
                        ? "text-green-600"
                        : Number(tx.amountMXN) < 0
                        ? "text-red-600"
                        : ""
                    }`}>
                      {tx.amountMXN
                        ? (Number(tx.amountMXN) > 0 ? "+" : "") +
                          formatCurrency(Number(tx.amountMXN))
                        : "-"}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      Number(tx.amountUSDT) > 0
                        ? "text-green-600"
                        : Number(tx.amountUSDT) < 0
                        ? "text-red-600"
                        : ""
                    }`}>
                      {tx.amountUSDT
                        ? (Number(tx.amountUSDT) > 0 ? "+" : "") +
                          formatCurrency(Number(tx.amountUSDT), "USDT")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {tx.exchangeRate
                        ? `$${Number(tx.exchangeRate).toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {tx.description || "-"}
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
