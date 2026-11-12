// Canonical display label for a campaign status.
//
// The backend enum is CampaignStatus (api/src/campaigns/campaign.entity.ts):
// draft | open | closed | completed. Three surfaces rendered the same
// status three different ways — My Campaigns showed "Pending" for open,
// the brand dashboard overview showed "Active", and the public campaign
// detail showed the raw "open" string. Every surface that displays a
// campaign status must use this helper so the label stays identical
// everywhere. (Gap 4.)
export function campaignStatusLabel(
  status: string | null | undefined
): string {
  const s = String(status ?? "")
    .trim()
    .toLowerCase();
  switch (s) {
    case "draft":
      return "Draft";
    case "open":
      return "Open";
    case "closed":
      return "Closed";
    case "completed":
      return "Completed";
    case "":
      return "—";
    default:
      return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
