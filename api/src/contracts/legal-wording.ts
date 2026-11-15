/**
 * Pacten Simple Transaction Agreement — the client-supplied wording
 * for the simpler agreement option (PACTEN_-Simple_contract.docx,
 * supplied by the client 14 Nov 2026; 11 sections, all placeholders).
 *
 * This text is stored VERBATIM as flat text. It is the default wording
 * for newly generated SIMPLE contracts. It can still be overridden
 * without a code change by setting the CONTRACT_LEGAL_WORDING env var
 * (the env value wins when set) — see contracts.service.ts legalWording().
 *
 * Rendering substitutes the [BRACKETED] placeholders per transaction
 * (contracts.service.ts renderSimpleAgreement): values frozen at
 * generation time in fieldValues, signature-block values computed at
 * render time from the signature columns. Blank values render as
 * "Not applicable". Already-generated contracts keep their snapshot.
 */
export const PLACEHOLDER_LEGAL_WORDING = `PACTEN
SIMPLE TRANSACTION AGREEMENT
Agreement Date: [DATE]
Agreement Reference: [AGREEMENT ID]
This agreement is between the following parties, who have connected through Pacten.
Party A – Client / Buyer
Name or Business: [PARTY A NAME]
Email: [PARTY A EMAIL]
Country: [PARTY A COUNTRY]
Party B – Provider / Seller
Name or Business: [PARTY B NAME]
Email: [PARTY B EMAIL]
Country: [PARTY B COUNTRY]
1. What Is Being Agreed?
Party B agrees to provide the following goods or services to Party A:
Description: [DESCRIPTION OF WORK OR GOODS]
Deliverables: [WHAT WILL BE PROVIDED]
Quantity (if applicable): [QUANTITY]
Requirements: [SPECIAL REQUIREMENTS]
Start Date and Time: [START DATE AND TIME]
Completion Date and Time: [DEADLINE AND TIME]
Time Zone: [TIME ZONE]
Both parties agree to the scope described above. Any changes must be approved by both parties in writing.
2. Payment
Total Price: [AMOUNT AND CURRENCY]
Payment Schedule: [UPFRONT / MILESTONE / COMPLETION]
Payment Due Date: [DATE]
Payment Release Conditions: [CONDITIONS]
Party A agrees to pay the agreed amount under these terms.
Payments processed through Pacten are subject to Pacten's applicable payment and platform terms, including relevant fees.
3. Responsibilities
Party B agrees to deliver the agreed goods or services with reasonable care and according to the agreed requirements and deadlines.
Party A agrees to provide necessary information, respond to reasonable requests and make payments as agreed.
Both parties must communicate promptly about significant problems or delays.
4. Delivery, Approval and Revisions
Party A may review the delivered work and request corrections where it does not meet the agreed requirements.
Review Period: [NUMBER OF DAYS]
Included Revisions: [NUMBER OR NOT APPLICABLE]
Additional Revision Terms: [DETAILS]
Any additional work or charges must be agreed by both parties before proceeding.
5. Ownership and Content Usage
Each party keeps ownership of materials it already owned before this agreement.
For newly created work, the parties agree:
Ownership of Deliverables: [OWNERSHIP TERMS]
Permitted Usage: [USAGE RIGHTS]
Usage Duration and Region: [DURATION AND REGION]
Platforms or Channels: [PLATFORMS]
Exclusivity (if applicable): [TERMS]
If no different arrangement is agreed, Party B retains ownership of newly created intellectual property and grants Party A a non-exclusive licence to use the paid-for deliverables for their agreed purpose once payment is received.
Any transfer of ownership must meet applicable legal requirements.
6. Cancellation and Refunds
Either party may request cancellation.
Cancellation Notice: [NOTICE PERIOD]
Refund Terms: [REFUND CONDITIONS]
Payment for Completed Work: [PAYMENT TERMS]
Both parties must agree in writing to any changes to the cancellation arrangement.
If either party seriously breaches this agreement, the other may give written notice and an opportunity to resolve the issue within [NUMBER OF DAYS], unless applicable law permits earlier termination.
Any mandatory legal rights remain unaffected.
7. Confidentiality and Compliance
Both parties agree to protect confidential information shared for the transaction and use it only for agreed purposes, unless disclosure is authorised or legally required.
Both parties must comply with applicable laws, including relevant advertising, intellectual property and data protection requirements.
Additional data processing arrangements may be needed where required by law.
8. Disagreements
If a disagreement occurs, both parties agree to attempt to resolve it through direct communication first.
Where available, they may use Pacten's applicable dispute-handling process.
If the dispute remains unresolved, either party may pursue remedies available under applicable law.
9. Pacten's Role
Pacten provides the marketplace through which the parties connect and arrange transactions.
Pacten is not a party to this agreement unless it separately agrees otherwise.
Pacten's own responsibilities, payment processes, fees and dispute procedures are governed by its separate Platform Terms and applicable law.
10. General Terms
Governing Law: [COUNTRY OR JURISDICTION]
Dispute Court Location: [COURT LOCATION]
Additional Agreed Terms: [OPTIONAL TERMS OR NONE]
Any amendments must be agreed by both parties in writing.
Nothing in this agreement removes rights or protections that cannot legally be excluded.
Electronic signatures may be used where legally permitted.
11. Signatures
By signing, both parties confirm that they have reviewed the completed agreement, accept its terms and intend to be legally bound.
Party A – Client / Buyer
Name: [FULL NAME]
Signature: [ELECTRONIC SIGNATURE]
Date and Time: [SIGNING DATE AND TIME]
Party B – Provider / Seller
Name: [FULL NAME]
Signature: [ELECTRONIC SIGNATURE]
Date and Time: [SIGNING DATE AND TIME]
Agreement Status: [STATUS]

End of Agreement
`;
