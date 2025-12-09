"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { payLoan } from "@/lib/actions/loans"
import { Check } from "lucide-react"

interface LoanActionsProps {
  loanId: string
}

export function LoanActions({ loanId }: LoanActionsProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handlePay = async () => {
    setLoading(true)
    try {
      await payLoan(loanId)
      toast({
        title: "Prestamo pagado",
        description: "El prestamo ha sido marcado como pagado",
      })
      setOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar como pagado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Check className="h-4 w-4 mr-1" />
          Marcar Pagado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Pago</DialogTitle>
          <DialogDescription>
            Al marcar como pagado, se descontara el monto del balance del operador.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePay} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
