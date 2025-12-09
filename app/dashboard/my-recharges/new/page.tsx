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
import { createRechargeRequest } from "@/lib/actions/recharges"
import { getCurrentExchangeRate } from "@/lib/actions/exchange-rate"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default function NewRechargePage() {
  const [loading, setLoading] = useState(false)
  const [amountMXN, setAmountMXN] = useState("")
  const [notes, setNotes] = useState("")
  const [currentRate, setCurrentRate] = useState<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    getCurrentExchangeRate().then((rate) => {
      if (rate) {
        setCurrentRate(Number(rate.sellRate))
      }
    })
  }, [])

  const estimatedUSDT = amountMXN && currentRate
    ? parseFloat(amountMXN) / currentRate
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user.operatorId) return

    setLoading(true)
    try {
      await createRechargeRequest({
        operatorId: session.user.operatorId,
        amountMXN: parseFloat(amountMXN),
        notes: notes || undefined,
      })
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de recarga ha sido enviada al administrador",
      })
      router.push("/dashboard/my-recharges")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la solicitud",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-recharges">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nueva Recarga</h1>
          <p className="text-muted-foreground">
            Solicita USDT para seguir operando
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Solicitar Recarga</CardTitle>
            <CardDescription>
              Indica cuanto MXN vas a pagar y el administrador te asignara los USDT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amountMXN">Monto a pagar (MXN)</Label>
                <Input
                  id="amountMXN"
                  type="number"
                  step="0.01"
                  value={amountMXN}
                  onChange={(e) => setAmountMXN(e.target.value)}
                  placeholder="500000"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Indica cuanto MXN vas a transferir para comprar USDT
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informacion adicional para el administrador"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading || !amountMXN}>
                  {loading ? "Enviando..." : "Enviar Solicitud"}
                </Button>
                <Link href="/dashboard/my-recharges">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimacion</CardTitle>
            <CardDescription>
              Basado en el tipo de cambio actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Tipo de cambio actual</p>
              <p className="text-2xl font-bold">
                {currentRate ? `$${currentRate.toFixed(2)} MXN` : "No disponible"}
              </p>
            </div>

            {amountMXN && currentRate && (
              <>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">MXN a pagar</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(parseFloat(amountMXN))}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">USDT estimado a recibir</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(estimatedUSDT, "USDT")}
                  </p>
                </div>
              </>
            )}

            <p className="text-xs text-muted-foreground">
              * El tipo de cambio final sera asignado por el administrador al aprobar la solicitud
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
