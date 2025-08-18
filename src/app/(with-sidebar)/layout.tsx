import SidebarLayout from "@/components/layout/SidebarLayout";

export default function WithSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
