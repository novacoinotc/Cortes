"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createLoanRequest } from "@/lib/actions/loans"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewLoanPage() {
  const [loading, setLoading] = useState(false)
  const [amountMXN, setAmountMXN] = useState("")
  const [reason, setReason] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user.operatorId) return

    setLoading(true)
    try {
      await createLoanRequest({
        operatorId: session.user.operatorId,
        amountMXN: parseFloat(amountMXN),
        reason,
      })
      toast({
        title: "Prestamo registrado",
        description: "El prestamo ha sido registrado y agregado a tu balance",
      })
      router.push("/dashboard/my-loans")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el prestamo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-loans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Solicitar Prestamo</h1>
          <p className="text-muted-foreground">
            Para ordenes mayores a tu fondo asignado
          </p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Nuevo Prestamo</CardTitle>
          <CardDescription>
            El monto sera agregado a tu balance inmediatamente.
            Recuerda pagarlo al finalizar la operacion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amountMXN">Monto en MXN</Label>
              <Input
                id="amountMXN"
                type="number"
                step="0.01"
                value={amountMXN}
                onChange={(e) => setAmountMXN(e.target.value)}
                placeholder="500000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo del prestamo</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Orden P2P de 1,500,000 MXN"
                rows={3}
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || !amountMXN || !reason}>
                {loading ? "Procesando..." : "Solicitar Prestamo"}
              </Button>
              <Link href="/dashboard/my-loans">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
