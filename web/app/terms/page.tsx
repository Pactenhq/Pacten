import { InfoPage, InfoSection } from "@/components/ui/InfoPage";

export default function TermsPage() {
  return (
    <InfoPage
      tag="Legal"
      title="Terms of Service"
      intro="This page summarises, in plain language, the terms that govern using Pacten. The contract generated for each deal contains the binding terms for that deal."
    >
      <InfoSection heading="The marketplace">
        <p>
          Pacten provides the platform that connects brands, creators and
          professionals. The agreement for each piece of work is the
          contract generated between the two parties on the platform.
        </p>
      </InfoSection>
      <InfoSection heading="Accounts">
        <p>
          You are responsible for your account and for the accuracy of the
          information on your profile and campaigns. Free plans have the
          limits shown on the Pricing page; paid plans remove those limits
          while the subscription is active.
        </p>
      </InfoSection>
      <InfoSection heading="Payments and commission">
        <p>
          Payments are processed by Stripe. The brand pays upfront; the
          payout is released to the creator or professional after approval,
          minus the commission for their current plan (Free 15%, Pro 10%,
          Elite 5%). Subscription prices are shown on the Pricing page.
        </p>
      </InfoSection>
      <InfoSection heading="Referrals">
        <p>
          Referral earnings follow the rules shown on the Referrals page:
          rewards are earned on subscription payments and completed paid
          deals by referred members, are not earned on free signups, and
          are reversed on refunds, chargebacks or fraud. Payouts are
          manual and monthly, with a $25 minimum.
        </p>
      </InfoSection>
      <InfoSection heading="Disputes">
        <p>
          Either party to a deal can open a dispute from the deal page.
          Pacten reviews the dispute and its decision on the release or
          refund of the deal payment is final within the platform.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
