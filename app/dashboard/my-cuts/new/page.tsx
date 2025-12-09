"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createOrUpdateDailyCut, getTodayCut } from "@/lib/actions/cuts"
import { getCurrentExchangeRate } from "@/lib/actions/exchange-rate"
import { ArrowLeft, Calculator } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default function NewCutPage() {
  const [loading, setLoading] = useState(false)
  const [operatorData, setOperatorData] = useState<{
    assignedFundMXN: number
    balanceMXN: number
    balanceUSDT: number
  } | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number>(0)

  const [endingBalanceMXN, setEndingBalanceMXN] = useState("")
  const [endingBalanceUSDT, setEndingBalanceUSDT] = useState("")
  const [totalSalesMXN, setTotalSalesMXN] = useState("")
  const [totalSalesUSDT, setTotalSalesUSDT] = useState("")
  const [notes, setNotes] = useState("")

  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    // Cargar tipo de cambio actual
    getCurrentExchangeRate().then((rate) => {
      if (rate) {
        setExchangeRate(Number(rate.sellRate))
      }
    })

    if (session?.user.operatorId) {
      // Cargar datos del operador y corte de hoy si existe
      fetch(`/api/operator/${session.user.operatorId}`)
        .then((res) => res.json())
        .then((data) => {
          setOperatorData({
            assignedFundMXN: data.assignedFundMXN,
            balanceMXN: data.balanceMXN,
            balanceUSDT: data.balanceUSDT,
          })
        })
        .catch(() => {})

      getTodayCut(session.user.operatorId).then((cut) => {
        if (cut) {
          setEndingBalanceMXN(cut.endingBalanceMXN.toString())
          setEndingBalanceUSDT(cut.endingBalanceUSDT.toString())
          setTotalSalesMXN(cut.totalSalesMXN.toString())
          setTotalSalesUSDT(cut.totalSalesUSDT.toString())
          setNotes(cut.notes || "")
        }
      })
    }
  }, [session])

  // Calcular valor total incluyendo USDT convertido a MXN
  const usdtValueInMXN = endingBalanceUSDT && exchangeRate
    ? parseFloat(endingBalanceUSDT) * exchangeRate
    : 0
  const totalValueMXN = (parseFloat(endingBalanceMXN) || 0) + usdtValueInMXN
  const calculatedProfit = operatorData && endingBalanceMXN
    ? totalValueMXN - operatorData.assignedFundMXN
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user.operatorId) return

    if (!exchangeRate || exchangeRate <= 0) {
      toast({
        title: "Error",
        description: "No hay tipo de cambio configurado. Contacta al administrador.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await createOrUpdateDailyCut({
        operatorId: session.user.operatorId,
        endingBalanceMXN: parseFloat(endingBalanceMXN),
        endingBalanceUSDT: parseFloat(endingBalanceUSDT),
        totalSalesMXN: parseFloat(totalSalesMXN),
        totalSalesUSDT: parseFloat(totalSalesUSDT),
        exchangeRate: exchangeRate,
        notes: notes || undefined,
      })
      toast({
        title: "Corte enviado",
        description: "Tu corte ha sido enviado para revision",
      })
      router.push("/dashboard/my-cuts")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el corte",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-cuts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Corte del Dia</h1>
          <p className="text-muted-foreground">
            Registra tus saldos y ventas del dia
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos del Corte</CardTitle>
            <CardDescription>
              Ingresa tus saldos actuales y el total de ventas del dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Saldos Actuales</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="endingBalanceMXN">Balance MXN</Label>
                    <Input
                      id="endingBalanceMXN"
                      type="number"
                      step="0.01"
                      value={endingBalanceMXN}
                      onChange={(e) => setEndingBalanceMXN(e.target.value)}
                      placeholder="1050000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endingBalanceUSDT">Balance USDT</Label>
                    <Input
                      id="endingBalanceUSDT"
                      type="number"
                      step="0.000001"
                      value={endingBalanceUSDT}
                      onChange={(e) => setEndingBalanceUSDT(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Ventas del Dia</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="totalSalesMXN">Total Ventas MXN</Label>
                    <Input
                      id="totalSalesMXN"
                      type="number"
                      step="0.01"
                      value={totalSalesMXN}
                      onChange={(e) => setTotalSalesMXN(e.target.value)}
                      placeholder="500000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalSalesUSDT">Total Ventas USDT</Label>
                    <Input
                      id="totalSalesUSDT"
                      type="number"
                      step="0.000001"
                      value={totalSalesUSDT}
                      onChange={(e) => setTotalSalesUSDT(e.target.value)}
                      placeholder="28000"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones del dia"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Corte"}
                </Button>
                <Link href="/dashboard/my-cuts">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculo de Utilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {operatorData ? (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tu fondo asignado</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(operatorData.assignedFundMXN)}
                    </p>
                  </div>

                  {exchangeRate > 0 && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600">Tipo de cambio actual</p>
                      <p className="text-xl font-bold text-purple-700">
                        ${exchangeRate.toFixed(2)} MXN por USDT
                      </p>
                    </div>
                  )}

                  {endingBalanceMXN && (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                        <p className="text-sm text-blue-600">Balance MXN</p>
                        <p className="text-xl font-bold text-blue-700">
                          {formatCurrency(parseFloat(endingBalanceMXN))}
                        </p>
                        {endingBalanceUSDT && parseFloat(endingBalanceUSDT) > 0 && exchangeRate > 0 && (
                          <>
                            <p className="text-sm text-blue-600 pt-2">
                              + Balance USDT ({formatCurrency(parseFloat(endingBalanceUSDT), "USDT")} × ${exchangeRate.toFixed(2)})
                            </p>
                            <p className="text-lg font-semibold text-blue-700">
                              {formatCurrency(usdtValueInMXN)}
                            </p>
                          </>
                        )}
                        <div className="border-t border-blue-200 pt-2 mt-2">
                          <p className="text-sm text-blue-600">= Valor total en MXN</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(totalValueMXN)}
                          </p>
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg ${
                        calculatedProfit >= 0 ? "bg-green-50" : "bg-red-50"
                      }`}>
                        <p className={`text-sm ${
                          calculatedProfit >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          Utilidad calculada
                        </p>
                        <p className={`text-3xl font-bold ${
                          calculatedProfit >= 0 ? "text-green-700" : "text-red-700"
                        }`}>
                          {formatCurrency(calculatedProfit)}
                        </p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatCurrency(totalValueMXN)} - {formatCurrency(operatorData.assignedFundMXN)}
                        </p>
                      </div>
                    </>
                  )}

                  <p className="text-xs text-muted-foreground">
                    La utilidad es: (Balance MXN + Balance USDT × TC) - Fondo asignado.
                    Esta cantidad deberas transferirla al administrador.
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Cargando datos...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Como hacer el corte</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Verifica tu saldo actual en MXN y USDT</li>
                <li>Suma todas las ventas del dia en P2P</li>
                <li>Ingresa los datos en el formulario</li>
                <li>Revisa que la utilidad calculada sea correcta</li>
                <li>Envia el corte para revision</li>
                <li>Una vez aprobado, transfiere la utilidad</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
