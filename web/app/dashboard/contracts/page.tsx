import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ContractCentre } from "@/components/contracts/ContractCentre";
import { brandNav, dashboardUser } from "@/lib/mock";

// desktop + "mob Contract" (394:52831)
// mobile: the brand "Contract Centre" list page — two summary cards,
// "Contract Status" with status pills, Upcoming Deadlines. Brand-side
// sidebar.
export default function ContractsPage() {
  return (
    <DashboardShell
      nav={brandNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <ContractCentre variant="brand" />
    </DashboardShell>
  );
}
