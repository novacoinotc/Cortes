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
  LogOut,
  DollarSign,
  Clock,
  Zap,
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
    <div className="flex flex-col h-full glass-sidebar text-white w-64 relative z-20">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center neon-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Cortes OTC
            </h1>
            <p className="text-purple-400/70 text-xs">
              {isAdmin ? "Administrador" : "Operador"}
            </p>
          </div>
        </div>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 neon-border"
                  : "text-purple-300/70 hover:text-purple-300 hover:bg-purple-500/10"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-purple-400")} />
              <span className="font-medium">{route.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-purple-500/20">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-purple-200 truncate">{session?.user?.name}</p>
            <p className="text-xs text-purple-400/60 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-purple-400/70 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar Sesion
        </Button>
      </div>
    </div>
  )
}
