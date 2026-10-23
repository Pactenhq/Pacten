import { InfoPage, InfoSection } from "@/components/ui/InfoPage";

export default function ContactPage() {
  return (
    <InfoPage
      tag="Company"
      title="Contact us"
      intro="Questions about your account, a campaign, a payment or a dispute — email us and we will get back to you."
    >
      <InfoSection heading="Email">
        <p>
          Write to us at{" "}
          <a
            className="font-semibold text-brand hover:underline"
            href="mailto:hello@pacten.info"
          >
            hello@pacten.info
          </a>
          . Please include the email address on your Pacten account and, for
          payment questions, the deal or campaign it relates to.
        </p>
      </InfoSection>
      <InfoSection heading="Disputes">
        <p>
          If something goes wrong with a deal, open a dispute from the deal
          page in your dashboard — our team reviews disputes there first.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
