"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createOperator } from "@/lib/actions/operators"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewOperatorPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      assignedFundMXN: parseFloat(formData.get("assignedFundMXN") as string),
    }

    try {
      await createOperator(data)
      toast({
        title: "Operador creado",
        description: "El operador ha sido creado exitosamente",
      })
      router.push("/dashboard/operators")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el operador",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/operators">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Operador</h1>
          <p className="text-muted-foreground">
            Crea un nuevo operador en el sistema
          </p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Datos del Operador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nombre del operador"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Contrasena inicial"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedFundMXN">Fondo Asignado (MXN)</Label>
              <Input
                id="assignedFundMXN"
                name="assignedFundMXN"
                type="number"
                step="0.01"
                placeholder="1000000"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Operador"}
              </Button>
              <Link href="/dashboard/operators">
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
