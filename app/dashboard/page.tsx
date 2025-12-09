export const dynamic = 'force-dynamic'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { OperatorDashboard } from "@/components/dashboard/operator-dashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "ADMIN"

  if (isAdmin) {
    return <AdminDashboard />
  }

  return <OperatorDashboard operatorId={session?.user?.operatorId!} />
}
