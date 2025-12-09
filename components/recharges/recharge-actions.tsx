"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { approveRechargeRequest, rejectRechargeRequest } from "@/lib/actions/recharges"
import { Check, X } from "lucide-react"

interface RechargeActionsProps {
  rechargeId: string
  currentRate?: number
}

export function RechargeActions({ rechargeId, currentRate }: RechargeActionsProps) {
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rate, setRate] = useState(currentRate?.toString() || "")
  const [rejectNotes, setRejectNotes] = useState("")
  const { toast } = useToast()

  const handleApprove = async () => {
    if (!rate || parseFloat(rate) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un tipo de cambio valido",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await approveRechargeRequest(rechargeId, parseFloat(rate))
      toast({
        title: "Recarga aprobada",
        description: "La recarga ha sido procesada exitosamente",
      })
      setApproveOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo aprobar la recarga",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await rejectRechargeRequest(rechargeId, rejectNotes)
      toast({
        title: "Recarga rechazada",
        description: "La solicitud ha sido rechazada",
      })
      setRejectOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo rechazar la recarga",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 justify-end">
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="default">
            <Check className="h-4 w-4 mr-1" />
            Aprobar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Recarga</DialogTitle>
            <DialogDescription>
              Confirma el tipo de cambio para esta recarga
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Tipo de Cambio (MXN por USDT)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="17.50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={loading}>
              {loading ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="destructive">
            <X className="h-4 w-4 mr-1" />
            Rechazar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Recarga</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Motivo (opcional)</Label>
              <Input
                id="notes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Razon del rechazo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading}>
              {loading ? "Procesando..." : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
