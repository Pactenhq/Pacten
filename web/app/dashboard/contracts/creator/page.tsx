import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ContractCentre } from "@/components/contracts/ContractCentre";
import { creatorNav, dashboardUser } from "@/lib/mock";

// desktop + "mob creator Contract"
// (394:53856) mobile: the creator "Contract Centre" list page —
// "Contract Centre" heading + subtitle, My Contracts/Templates tabs,
// four stat cards, Contract Status, Upcoming Deadlines, Contract
// Templates. Creator sidebar (no Employer entry).
export default function CreatorContractsPage() {
  return (
    <DashboardShell
      nav={creatorNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <ContractCentre variant="creator" />
    </DashboardShell>
  );
}
