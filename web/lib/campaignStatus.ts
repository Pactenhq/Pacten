// Canonical display label for a campaign-application status.
//
// The backend enum is ApplicationStatus
// (api/src/campaigns/application.entity.ts): pending | under_review |
// accepted | rejected | withdrawn | converted_to_deal. Two surfaces
// rendered the raw enum string as the status pill (Applications Received
// and the campaign-manage Applications list showed the literal
// "converted_to_deal"), and the creator My Applications page fell
// through to the raw value for every status it did not map. Every
// surface that displays an application status must use this helper so
// no raw enum ever reaches a pill again. (Label fix, Nov 12.)
// NOTE: the brand dashboard Recent Requests table keeps its own
// vocabulary (Submitted / Accepted / Active) — it does not use this
// helper.
export function applicationStatusLabel(
  status: string | null | undefined
): string {
  const s = String(status ?? "")
    .trim()
    .toLowerCase();
  switch (s) {
    case "pending":
      return "Pending";
    case "under_review":
      return "Under Review";
    case "shortlisted":
      return "Shortlisted";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "withdrawn":
      return "Withdrawn";
    case "converted_to_deal":
      return "Converted";
    case "":
      return "—";
    default:
      return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
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
