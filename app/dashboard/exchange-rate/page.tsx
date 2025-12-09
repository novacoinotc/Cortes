import { getCurrentExchangeRate, getExchangeRateHistory } from "@/lib/actions/exchange-rate"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SetExchangeRateForm } from "@/components/exchange-rate/set-rate-form"
import { Badge } from "@/components/ui/badge"

export default async function ExchangeRatePage() {
  const [currentRate, history] = await Promise.all([
    getCurrentExchangeRate(),
    getExchangeRateHistory(20),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tipo de Cambio</h1>
        <p className="text-muted-foreground">
          Configura el tipo de cambio para las recargas de USDT
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Cambio Actual</CardTitle>
            <CardDescription>
              Este es el precio al que vendes USDT a los operadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
                <p className="text-sm text-blue-100">Precio de Venta</p>
                <p className="text-4xl font-bold">
                  ${currentRate ? Number(currentRate.sellRate).toFixed(2) : "0.00"} MXN
                </p>
                <p className="text-sm text-blue-200 mt-2">por 1 USDT</p>
              </div>

              {currentRate?.buyRate && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Precio de Compra (referencia)</p>
                  <p className="text-xl font-bold">
                    ${Number(currentRate.buyRate).toFixed(2)} MXN
                  </p>
                </div>
              )}

              {currentRate && (
                <div className="text-sm text-muted-foreground">
                  <p>Establecido por: {currentRate.setBy.name}</p>
                  <p>Fecha: {formatDateTime(currentRate.createdAt)}</p>
                  {currentRate.notes && <p>Notas: {currentRate.notes}</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Establecer Nuevo Tipo de Cambio</CardTitle>
            <CardDescription>
              El nuevo tipo de cambio se aplicara a las siguientes recargas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetExchangeRateForm currentRate={currentRate ? Number(currentRate.sellRate) : undefined} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Tipos de Cambio</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay historial
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Precio Venta</TableHead>
                  <TableHead className="text-right">Precio Compra</TableHead>
                  <TableHead>Establecido por</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>{formatDateTime(rate.createdAt)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(rate.sellRate).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {rate.buyRate ? `$${Number(rate.buyRate).toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>{rate.setBy.name}</TableCell>
                    <TableCell>
                      {rate.isActive ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {rate.notes || "-"}
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
