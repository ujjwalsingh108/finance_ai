export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="auth-container">{children}</div>;
}
