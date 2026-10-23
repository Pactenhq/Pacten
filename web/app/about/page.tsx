import { InfoPage, InfoSection } from "@/components/ui/InfoPage";

export default function AboutPage() {
  return (
    <InfoPage
      tag="Company"
      title="About Pacten"
      intro="Pacten is the marketplace where brands hire creators and professionals for campaigns — with contracts, secure payments and clear commissions built in."
    >
      <InfoSection heading="What we do">
        <p>
          Brands post campaigns and discover verified creators and
          professionals. Creators and professionals build public profiles,
          apply to campaigns, and receive direct opportunities. When both
          sides agree, Pacten generates the contract, collects payment
          securely through Stripe, and releases the payout when the work is
          approved.
        </p>
      </InfoSection>
      <InfoSection heading="How it works">
        <p>
          1. Discover — search creators and professionals by niche, platform
          and rate. 2. Deal — agree the scope and budget, sign the contract,
          and the brand pays upfront. 3. Deliver &amp; get paid — the creator
          submits the work, the brand approves it, and the payout is released
          minus the plan commission.
        </p>
      </InfoSection>
      <InfoSection heading="Referrals">
        <p>
          Every member can invite others with a personal referral link and
          earn rewards when referred members subscribe or complete paid
          deals, under the referral rules shown on the Referrals page.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
