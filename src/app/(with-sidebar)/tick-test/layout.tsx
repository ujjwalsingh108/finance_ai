import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default function TickTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();

  // Add any authentication checks here if needed
  // For example:
  // if (!isAuthenticated) {
  //   redirect('/login');
  // }

  return <>{children}</>;
}
