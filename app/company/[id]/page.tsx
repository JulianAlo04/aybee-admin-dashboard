import CompanyDetailShell from "@/components/company/CompanyDetailShell";

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompanyDetailShell companyId={id} />;
}
