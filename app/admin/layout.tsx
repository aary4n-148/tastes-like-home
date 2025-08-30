// This layout applies to all admin routes
// The login page will not use this layout due to Next.js routing
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
