"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { setExchangeRate } from "@/lib/actions/exchange-rate"

interface SetExchangeRateFormProps {
  currentRate?: number
}

export function SetExchangeRateForm({ currentRate }: SetExchangeRateFormProps) {
  const [loading, setLoading] = useState(false)
  const [sellRate, setSellRate] = useState(currentRate?.toString() || "")
  const [buyRate, setBuyRate] = useState("")
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sellRate || parseFloat(sellRate) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un precio de venta valido",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await setExchangeRate({
        sellRate: parseFloat(sellRate),
        buyRate: buyRate ? parseFloat(buyRate) : undefined,
        notes: notes || undefined,
      })
      toast({
        title: "Tipo de cambio actualizado",
        description: "El nuevo tipo de cambio esta activo",
      })
      setNotes("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el tipo de cambio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sellRate">Precio de Venta (MXN por USDT)</Label>
        <Input
          id="sellRate"
          type="number"
          step="0.01"
          value={sellRate}
          onChange={(e) => setSellRate(e.target.value)}
          placeholder="17.50"
          required
        />
        <p className="text-xs text-muted-foreground">
          Este es el precio al que los operadores te pagan por USDT
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="buyRate">Precio de Compra (opcional)</Label>
        <Input
          id="buyRate"
          type="number"
          step="0.01"
          value={buyRate}
          onChange={(e) => setBuyRate(e.target.value)}
          placeholder="17.20"
        />
        <p className="text-xs text-muted-foreground">
          Tu costo de compra como referencia
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Razon del cambio de precio"
          rows={2}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Actualizando..." : "Actualizar Tipo de Cambio"}
      </Button>
    </form>
  )
}
