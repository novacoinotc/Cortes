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
import { approveDailyCut, rejectDailyCut } from "@/lib/actions/cuts"
import { Check, X } from "lucide-react"

interface CutActionsProps {
  cutId: string
}

export function CutActions({ cutId }: CutActionsProps) {
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rejectNotes, setRejectNotes] = useState("")
  const { toast } = useToast()

  const handleApprove = async () => {
    setLoading(true)
    try {
      await approveDailyCut(cutId)
      toast({
        title: "Corte aprobado",
        description: "El corte ha sido aprobado exitosamente",
      })
      setApproveOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo aprobar el corte",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await rejectDailyCut(cutId, rejectNotes)
      toast({
        title: "Corte rechazado",
        description: "El operador debera corregir el corte",
      })
      setRejectOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo rechazar el corte",
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
            <DialogTitle>Aprobar Corte</DialogTitle>
            <DialogDescription>
              Al aprobar, se actualizara el balance del operador con los valores reportados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={loading}>
              {loading ? "Procesando..." : "Aprobar Corte"}
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
            <DialogTitle>Rechazar Corte</DialogTitle>
            <DialogDescription>
              El operador debera corregir y volver a enviar el corte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Motivo del rechazo</Label>
              <Input
                id="notes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Indica que debe corregir"
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
