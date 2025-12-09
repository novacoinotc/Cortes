"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  ArrowUpDown,
  Wallet,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  DollarSign,
  Clock,
} from "lucide-react"

const adminRoutes = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/operators", label: "Operadores", icon: Users },
  { href: "/dashboard/recharges", label: "Recargas", icon: ArrowUpDown },
  { href: "/dashboard/loans", label: "Prestamos", icon: Wallet },
  { href: "/dashboard/cuts", label: "Cortes", icon: FileText },
  { href: "/dashboard/exchange-rate", label: "Tipo de Cambio", icon: DollarSign },
  { href: "/dashboard/reports", label: "Reportes", icon: TrendingUp },
]

const operatorRoutes = [
  { href: "/dashboard", label: "Mi Panel", icon: LayoutDashboard },
  { href: "/dashboard/my-recharges", label: "Mis Recargas", icon: ArrowUpDown },
  { href: "/dashboard/my-loans", label: "Mis Prestamos", icon: Wallet },
  { href: "/dashboard/my-cuts", label: "Mis Cortes", icon: FileText },
  { href: "/dashboard/history", label: "Historial", icon: Clock },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const routes = isAdmin ? adminRoutes : operatorRoutes

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Cortes OTC</h1>
        <p className="text-gray-400 text-sm mt-1">
          {isAdmin ? "Administrador" : "Operador"}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = pathname === route.href
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-5 w-5" />
              {route.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesion
        </Button>
      </div>
    </div>
  )
}
