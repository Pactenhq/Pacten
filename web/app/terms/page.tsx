import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";

// Full Platform Terms and Conditions, verbatim from the client-supplied
// document (PACTEN_-_TOS.docx, v1.0 "Draft for review"). The effective
// date in the source is a blank placeholder, shown here as
// "To be confirmed". Do not paraphrase, summarise or drop clauses:
// this page is the binding text.
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-ink-900">
      <Navbar />
      <main className="mx-auto max-w-[846px] px-6 py-16 lg:py-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand dark:text-brand-200">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
          Platform Terms and Conditions
        </h1>
        <div className="mt-4 space-y-1 text-[15px] leading-relaxed text-ink-500 dark:text-ink-300">
          <p>Platform operator: Pacten Ltd</p>
          <p>Registered in: England and Wales</p>
          <p>
            Contact:{" "}
            <a
              href="mailto:hello@pacten.info"
              className="font-semibold text-brand dark:text-brand-200 hover:underline"
            >
              hello@pacten.info
            </a>
          </p>
          <p>Version 1.0 &mdash; Draft for review</p>
          <p>Effective date: To be confirmed</p>
        </div>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-700 dark:text-ink-200">
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">1. About Pacten</h2>
        <div className="mt-2 space-y-3">
          <p>1.1. Pacten is an online marketplace that connects businesses, content creators, influencers and social media professionals.</p>
          <p>1.2. The platform allows users to create profiles, discover opportunities, publish listings, apply for work, communicate, enter into agreements and arrange payments.</p>
          <p>1.3. Pacten is operated by Pacten Ltd, a company registered in England and Wales.</p>
          <p>1.4. By creating an account or using the platform, you agree to these Terms and Conditions.</p>
          <p>1.5. If you do not agree to these terms, you must not use the platform.</p>
          <p>1.6. Pacten generally acts as a marketplace facilitator. Unless expressly agreed otherwise, Pacten is not a party to contracts made between users and does not employ, represent or act as the agent of either party.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">2. Eligibility and accounts</h2>
        <div className="mt-2 space-y-3">
          <p>2.1. You must be at least 18 years old to register for or use Pacten.</p>
          <p>2.2. You must provide accurate, complete and current information when creating an account.</p>
          <p>2.3. You are responsible for keeping your login details secure and for activity carried out through your account, except where responsibility rests with Pacten under applicable law.</p>
          <p>2.4. You must notify Pacten promptly if you suspect unauthorised access to your account.</p>
          <p>2.5. Businesses and other organisations must ensure that anyone registering on their behalf has authority to do so.</p>
          <p>2.6. Pacten may require email verification before allowing access to certain platform features.</p>
          <p>2.7. Multiple accounts: Are permitted, but each account has to be paid for separately.</p>
          <p>2.8. You must not create accounts using false identities, impersonate another person or business, or attempt to bypass account restrictions.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">3. User categories</h2>
        <div className="mt-2 space-y-3">
          <p>3.1. Pacten supports three primary categories of users:</p>
          <p>Businesses: Organisations or individuals seeking creators, influencers or social media professionals.</p>
          <p>Creators and Influencers: Individuals or businesses offering content creation, promotional or related services.</p>
          <p>Social Media Professionals: Individuals or businesses offering social media management, marketing, consultancy and related services.</p>
          <p>3.2. Users must select an appropriate account category and provide accurate information about the services they offer or seek.</p>
          <p>3.3. Pacten does not guarantee that any user will receive work, secure clients, earn income or achieve particular commercial results.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">4. Listings, opportunities and applications</h2>
        <div className="mt-2 space-y-3">
          <p>4.1. Eligible users may publish campaigns, jobs, collaboration opportunities, service listings and other permitted content.</p>
          <p>4.2. Listings must be accurate, lawful and not misleading.</p>
          <p>4.3. Users must not publish fraudulent opportunities, misleading compensation offers, unlawful requests or content that infringes another person's rights.</p>
          <p>4.4. Users are responsible for checking the suitability, qualifications and reliability of other users before entering into agreements.</p>
          <p>4.5. Pacten may remove listings that violate these terms or applicable law.</p>
          <p>4.6. Pacten does not guarantee the availability, quality, legality or successful completion of opportunities advertised on the platform.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">5. Agreements between users</h2>
        <div className="mt-2 space-y-3">
          <p>5.1. Users may enter into agreements with each other for goods, services, campaigns, collaborations or other permitted transactions.</p>
          <p>5.2. Pacten may provide optional agreement templates and electronic signing functionality.</p>
          <p>5.3. Agreement templates are provided for convenience and are not a substitute for independent legal advice.</p>
          <p>5.4. Users are responsible for reviewing and agreeing their own transaction terms, including:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>The work, goods or services required.</li>
            <li>Price and payment arrangements.</li>
            <li>Deliverables and deadlines.</li>
            <li>Intellectual property and usage rights.</li>
            <li>Cancellation and revision arrangements.</li>
            <li>Any applicable legal or regulatory requirements.</li>
        </ul>
          <p>5.5. Agreements may be customised to reflect the particular transaction and the parties' requirements.</p>
          <p>5.6. Pacten does not guarantee that a user-generated or template-based agreement is legally appropriate or enforceable in every jurisdiction.</p>
          <p>5.7. Each party remains responsible for fulfilling its obligations under its agreement with the other party.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">6. Payments and platform commissions</h2>
        <div className="mt-2 space-y-3">
          <p>6.1. Pacten uses Stripe to support payment processing.</p>
          <p>6.2. Payment processing may be subject to additional terms imposed by Stripe and other relevant payment service providers.</p>
          <p>6.3. Pacten may charge transaction commissions based on the subscription plan applicable to the relevant user.</p>
          <p>6.4. Commission rates may differ between free and paid subscription plans and between participating parties.</p>
          <p>6.5. The applicable commission rates and calculation methods will be set out in Pacten's published pricing and fee schedule.</p>
          <p>6.6. Before a user commits to a paid transaction, Pacten should display the applicable platform charges and the amount payable or receivable, including relevant deductions.</p>
          <p>6.7. Funds are intended to be released to the person providing goods or services after the agreed work or delivery has been completed, subject to the agreed completion process, payment provider requirements and any applicable dispute, refund or legal restrictions.</p>
          <p>6.8. Completion confirmation: Completion is verified by customer approval. If a client does not respond for a period of fourteen working days, the work is automatically completed and funds approved.</p>
          <p>6.9. Payout timing may depend on Stripe's processing requirements, banking arrangements and other factors outside Pacten's reasonable control.</p>
          <p>6.10. Users are responsible for their own applicable taxes and reporting obligations unless the law requires otherwise.</p>
          <p>6.11. Pacten may take proportionate action concerning payments where fraud, a genuine dispute, suspected unlawful activity or another legitimate reason requires it, subject to applicable law and the payment provider's terms.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">7. Subscriptions and billing</h2>
        <div className="mt-2 space-y-3">
          <p>7.1. Pacten may offer free and paid subscription plans.</p>
          <p>7.2. Paid plans may provide additional features, increased visibility, enhanced functionality or reduced transaction commission rates.</p>
          <p>7.3. Subscription prices, billing periods, included features and applicable commission rates will be displayed before purchase.</p>
          <p>7.4. Where a subscription renews automatically, Pacten will disclose the renewal arrangements and recurring charges before purchase.</p>
          <p>7.5. Users may cancel subscriptions through the available account controls or by contacting Pacten.</p>
          <p>7.6. Unless otherwise stated at purchase, cancellation stops future renewals and access to paid features continues until the end of the current paid billing period.</p>
          <p>7.7. Subscription fees are generally non-refundable, except where required by applicable law or where Pacten expressly agrees otherwise.</p>
          <p>7.8. Nothing in these terms limits statutory cancellation, refund or other consumer rights that cannot legally be excluded.</p>
          <p>7.9. Pacten may change subscription pricing or features, subject to appropriate notice, applicable law and any existing contractual commitments.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">8. Referrals and rewards</h2>
        <div className="mt-2 space-y-3">
          <p>8.1. Pacten may operate a referral programme for businesses, creators and social media professionals.</p>
          <p>8.2. Eligible users may receive referral links or codes to invite new users to the platform.</p>
          <p>8.3. Referral rewards are subject to Pacten's published referral programme rules, including eligibility conditions, qualifying events, reward amounts and payment arrangements.</p>
          <p>8.4. Users must not refer themselves, create fraudulent accounts or manipulate referral tracking.</p>
          <p>8.5. Pacten may investigate suspected referral abuse and withhold or cancel rewards that do not satisfy the published programme rules, subject to applicable law.</p>
          <p>8.6. Pacten may amend or discontinue the referral programme prospectively, subject to applicable law and any rewards already earned.</p>
          <p>8.7. Referral schedule: Eligible Pacten users may earn cash rewards by referring new Businesses, Creators or Social Media Professionals through their unique referral links or codes.</p>
          <p>Referral rewards are calculated as follows:</p>
          <p>Subscription referrals: 20% of each of the referred user's first three successful paid subscription payments.</p>
          <p>Transaction referrals: 10% of the commission actually received by Pacten from the referred user's first qualifying paid collaboration.</p>
          <p>Free registrations: Referrals of users who register for free accounts will be tracked but will not automatically generate cash rewards.</p>
          <p>Minimum payout: $25 USD in accumulated, approved referral rewards.</p>
          <p>Payment frequency: Eligible rewards will be paid monthly, following verification and manual approval by Pacten.</p>
          <p>Rewards are calculated on successfully received payments, excluding refunds, chargebacks and reversed transactions. Any applicable taxes and payment processing deductions will be handled in accordance with the published Referral Programme Rules.</p>
          <p>Self-referrals, fraudulent registrations and attempts to manipulate the referral system are prohibited. Pacten reserves the right to investigate suspected abuse and reject ineligible rewards.</p>
          <p>There is no limit to the number of genuine users an eligible participant may refer.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">9. Account and social media verification</h2>
        <div className="mt-2 space-y-3">
          <p>9.1. Pacten may require users to verify their email addresses.</p>
          <p>9.2. Pacten may offer verification badges for users who demonstrate ownership or authorised control of linked social media accounts.</p>
          <p>9.3. Verification may involve connecting an account through an authorised integration or completing another approved ownership verification process.</p>
          <p>9.4. A verification badge indicates only that the relevant verification checks have been completed.</p>
          <p>9.5. A badge does not guarantee a user's identity, qualifications, trustworthiness, financial position, audience authenticity or quality of services.</p>
          <p>9.6. Pacten may remove verification status where account ownership can no longer be confirmed or where verification has been obtained improperly.</p>
          <p>9.7. Users must not misrepresent their verification status.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">10. Reviews and feedback</h2>
        <div className="mt-2 space-y-3">
          <p>10.1. Where review functionality is available, users may submit feedback about genuine transactions or experiences, subject to Pacten's review rules.</p>
          <p>10.2. Reviews must be truthful, relevant and based on genuine experiences.</p>
          <p>10.3. Fake reviews, purchased reviews, impersonation, harassment and attempts to manipulate ratings are prohibited.</p>
          <p>10.4. Pacten may investigate and remove reviews that breach these terms or applicable law.</p>
          <p>10.5. Pacten does not guarantee the accuracy of every review.</p>
          <p>10.6. Reviews represent the opinions of their authors and do not necessarily represent Pacten's views.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">11. Platform communications and prohibited conduct</h2>
        <div className="mt-2 space-y-3">
          <p>11.1. Users may communicate through Pacten's messaging and other available communication features.</p>
          <p>11.2. Users must not use the platform to harass, threaten, defraud or unlawfully discriminate against others.</p>
          <p>11.3. Users must not distribute malware, send unlawful spam, scrape protected platform data without authorisation or interfere with platform security.</p>
          <p>11.4. Users must not use Pacten to arrange unlawful transactions.</p>
          <p>11.5. Users must comply with applicable advertising, marketing, consumer protection, intellectual property and other laws relevant to their activities.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">12. Circumventing platform fees</h2>
        <div className="mt-2 space-y-3">
          <p>12.1. Users must not deliberately move a transaction originating through Pacten outside the platform for the purpose of avoiding applicable Pacten transaction commissions.</p>
          <p>12.2. This includes using platform introductions or communications to arrange payment elsewhere specifically to avoid agreed platform fees.</p>
          <p>12.3. This restriction applies only within the scope and duration specified in Pacten's published fee and anti-circumvention policy.</p>
          <p>12.4. Pacten may investigate suspected fee avoidance and take proportionate action, including account restrictions or recovery of properly due fees where legally enforceable.</p>
          <p>12.5. Nothing in this clause prevents users from exercising statutory rights or engaging in lawful activities that cannot validly be restricted.</p>
          <p>12.6. Restriction period and scope: Users must not deliberately circumvent Pacten's platform fees by arranging or completing transactions outside Pacten with another user they first connected with through the platform.</p>
          <p>This restriction applies during the user's membership and for 12 months following the initial introduction between the relevant users through Pacten.</p>
          <p>The restriction applies only to transactions arising from relationships or opportunities established through Pacten. It does not apply to pre-existing business relationships or independently established commercial relationships.</p>
          <p>Users may communicate outside Pacten where necessary to complete their work, provided they do not deliberately avoid applicable platform fees.</p>
          <p>Pacten reserves the right to investigate suspected circumvention and recover commissions properly owed where legally enforceable.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">13. Disputes between users</h2>
        <div className="mt-2 space-y-3">
          <p>13.1. Users should first attempt to resolve disagreements directly and in good faith.</p>
          <p>13.2. Where a dispute cannot be resolved, users may contact Pacten for assistance.</p>
          <p>13.3. Pacten may facilitate communication, request relevant evidence and help users explore a mutually acceptable resolution.</p>
          <p>13.4. Pacten's role is generally to facilitate resolution, not to act as a court, arbitrator or legal representative.</p>
          <p>13.5. Pacten does not guarantee that a dispute will be resolved.</p>
          <p>13.6. Payment disputes, refunds, chargebacks and payout restrictions may also be subject to payment provider rules and applicable law.</p>
          <p>13.7. Dispute Resolution Procedure</p>
          <h3 className="text-lg font-bold text-ink-900 dark:text-ink-50">13.7.1. Reporting a Dispute</h3>
          <p>Users should report disputes concerning payments, deliverables or services through Pacten's available support channels or by contacting hello@pacten.info.</p>
          <p>Disputes should normally be reported within seven (7) calendar days of the relevant work being submitted as completed or the goods being delivered.</p>
          <p>This reporting period does not limit any statutory rights, payment provider rights or legal remedies available to users.</p>
          <h3 className="text-lg font-bold text-ink-900 dark:text-ink-50">13.7.2. Responding to a Dispute</h3>
          <p>Pacten may notify the other party of the dispute and request a response within seven (7) calendar days.</p>
          <p>Both parties are expected to cooperate in good faith and provide relevant information.</p>
          <h3 className="text-lg font-bold text-ink-900 dark:text-ink-50">13.7.3. Supporting Evidence</h3>
          <p>Pacten may request evidence reasonably relevant to the dispute, including:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>The agreement between the parties.</li>
            <li>Messages and communications relating to the transaction.</li>
            <li>Evidence of completed work or delivered goods.</li>
            <li>Agreed deadlines, revisions and deliverables.</li>
            <li>Payment confirmations or other relevant records.</li>
          </ul>
          <h3 className="text-lg font-bold text-ink-900 dark:text-ink-50">13.7.4. Payment Holds</h3>
          <p>Where a dispute is reported before payment has been released, Pacten may request or apply a temporary payout restriction where supported by its payment arrangements and permitted by applicable law.</p>
          <p>Any payment restriction will be subject to Stripe's applicable terms, the actual payment configuration and relevant legal requirements.</p>
          <p>Pacten does not guarantee that funds can be held, reversed or recovered after payment has been processed.</p>
          <h3 className="text-lg font-bold text-ink-900 dark:text-ink-50">13.7.5. Facilitating Resolution</h3>
          <p>Pacten may assist both parties by facilitating communication, reviewing submitted information and encouraging a mutually acceptable resolution.</p>
          <p>Pacten does not act as a court or independent arbitrator and does not guarantee a particular outcome.</p>
          <p>Any refund, partial payment or other settlement should be agreed between the parties, unless a payment provider decision or applicable law requires otherwise.</p>
          <h3 className="text-lg font-bold text-ink-900 dark:text-ink-50">13.7.6. Unresolved Disputes</h3>
          <p>If the parties cannot reach an agreement, they remain entitled to pursue available remedies under their own contract and applicable law.</p>
          <p>Pacten may close its internal dispute assistance process after reasonable efforts to facilitate resolution.</p>
          <h3 className="text-lg font-bold text-ink-900 dark:text-ink-50">13.7.7. Fraud and Misconduct</h3>
          <p>Pacten may separately investigate suspected fraud, deliberate misrepresentation or serious breaches of its Platform Terms and take proportionate action, including account restrictions, where justified.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">14. Intellectual property and user content</h2>
        <div className="mt-2 space-y-3">
          <p>14.1. Users retain ownership of intellectual property they own in content they upload, subject to any separate agreements they enter into.</p>
          <p>14.2. By uploading content to Pacten, users grant Pacten a non-exclusive licence to host, store, display and technically process that content as reasonably necessary to operate and promote the platform and its features.</p>
          <p>14.3. Users must have the necessary rights and permissions to upload or share their content.</p>
          <p>14.4. Ownership and permitted use of work created for a client should be addressed in the agreement between the relevant users.</p>
          <p>14.5. Pacten does not automatically acquire ownership of deliverables created under agreements between users.</p>
          <p>14.6. Pacten's name, branding, platform design and proprietary materials remain protected by applicable intellectual property laws.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">15. Privacy and personal information</h2>
        <div className="mt-2 space-y-3">
          <p>15.1. Pacten processes personal information in accordance with its Privacy Policy and applicable data protection laws.</p>
          <p>15.2. Users must handle personal information obtained through the platform lawfully and responsibly.</p>
          <p>15.3. Users must not collect, disclose or misuse other users' personal information without a lawful basis.</p>
          <p>15.4. Additional information about personal data processing, retention, international transfers and individual rights will be provided in Pacten's Privacy Policy.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">16. Suspension and termination</h2>
        <div className="mt-2 space-y-3">
          <p>16.1. Users may request account closure, subject to outstanding contractual, payment or legal obligations.</p>
          <p>16.2. Pacten may suspend, restrict or terminate accounts where there is a legitimate reason, including serious or repeated breaches of these terms, fraud, security risks or unlawful conduct.</p>
          <p>16.3. Where reasonably appropriate, Pacten will provide notice and an opportunity to address the issue.</p>
          <p>16.4. Immediate restrictions may be necessary in serious cases, including fraud or security threats.</p>
          <p>16.5. Account closure does not automatically cancel outstanding obligations, completed transactions, validly incurred fees or legal record-keeping requirements.</p>
          <p>16.6. Pacten will handle remaining funds and personal information in accordance with applicable law, its Privacy Policy and payment provider requirements.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">17. Platform availability and changes</h2>
        <div className="mt-2 space-y-3">
          <p>17.1. Pacten aims to provide a reliable and secure marketplace but does not guarantee uninterrupted or error-free availability.</p>
          <p>17.2. Features may occasionally be unavailable because of maintenance, technical issues, security requirements or external service interruptions.</p>
          <p>17.3. Pacten may update or discontinue platform features where reasonably necessary, subject to applicable law and contractual commitments.</p>
          <p>17.4. Pacten will provide appropriate notice where a change materially affects users' rights or paid services.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">18. Responsibility and liability</h2>
        <div className="mt-2 space-y-3">
          <p>18.1. Pacten is responsible for providing its platform services with the standard of care required by applicable law.</p>
          <p>18.2. Users are responsible for their own listings, statements, agreements, deliverables and conduct.</p>
          <p>18.3. Pacten does not generally guarantee the performance or reliability of third parties using the marketplace.</p>
          <p>18.4. To the extent permitted by applicable law, Pacten is not responsible for losses caused solely by another user's independent breach of an agreement or unlawful conduct.</p>
          <p>18.5. Nothing in these terms excludes or restricts liability for fraud, fraudulent misrepresentation, death or personal injury caused by negligence, or any other liability that cannot legally be excluded or limited.</p>
          <p>18.6. Nothing in these terms removes mandatory consumer rights or other protections under applicable law.</p>
          <p>18.7. Any further liability cap or exclusion must be separately drafted and reviewed for enforceability before publication.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">19. Changes to these terms</h2>
        <div className="mt-2 space-y-3">
          <p>19.1. Pacten may update these terms to reflect changes to its services, legal obligations or business operations.</p>
          <p>19.2. Pacten will provide appropriate notice of material changes.</p>
          <p>19.3. Where required by law, Pacten will obtain consent or provide applicable termination rights before changes take effect.</p>
          <p>19.4. The current version will be available on the platform.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">20. Governing law and complaints</h2>
        <div className="mt-2 space-y-3">
          <p>20.1. These terms are intended to be governed by the laws of England and Wales, subject to any mandatory legal protections that apply to users in other jurisdictions.</p>
          <p>20.2. The courts of England and Wales will have jurisdiction to the extent permitted by applicable law. This provision does not remove mandatory rights to bring proceedings elsewhere.</p>
          <p>20.3. Users may submit complaints or legal enquiries to hello@pacten.info.</p>
          <p>20.4. Pacten will review complaints and respond within a reasonable period, taking account of any applicable legal requirements.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">21. General provisions</h2>
        <div className="mt-2 space-y-3">
          <p>21.1. If any provision of these terms is found to be unenforceable, the remaining provisions will continue to apply to the extent legally possible.</p>
          <p>21.2. A delay by Pacten in enforcing a provision does not automatically mean that Pacten has waived its rights.</p>
          <p>21.3. These terms, together with applicable policies and any additional terms expressly agreed for particular services, govern use of the Pacten platform.</p>
          <p>21.4. Separate agreements between users govern their own transactions and do not automatically make Pacten a party to those agreements.</p>
          <p>Pacten Ltd</p>
          <p>Registered in England and Wales</p>
          <p>Email: hello@pacten.info</p>
        </div>
      </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
