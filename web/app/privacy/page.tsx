import { InfoPage, InfoSection } from "@/components/ui/InfoPage";

export default function PrivacyPage() {
  return (
    <InfoPage
      tag="Legal"
      title="Privacy Policy"
      intro="This page summarises, in plain language, what data Pacten collects and how it is used."
    >
      <InfoSection heading="Data we collect">
        <p>
          Account data (name, email, role), profile data you publish
          (bio, niches, platforms, rates, portfolio links), campaign and
          deal information, messages sent through the platform, and
          referral activity. Payment card details are collected and
          processed by Stripe — Pacten never stores full card numbers.
        </p>
      </InfoSection>
      <InfoSection heading="How we use it">
        <p>
          To operate the marketplace: matching brands with creators and
          professionals, generating contracts, processing payments and
          payouts, calculating commissions and referral earnings, and
          keeping accounts secure. We do not sell your personal data.
        </p>
      </InfoSection>
      <InfoSection heading="Cookies">
        <p>
          We use cookies that are necessary for sign-in sessions and basic
          site functionality.
        </p>
      </InfoSection>
      <InfoSection heading="Your rights">
        <p>
          You can ask for a copy of your data or for your account to be
          deleted by writing to hello@pacten.info. Some records (for
          example completed payment records) may be kept where the law
          requires it.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
