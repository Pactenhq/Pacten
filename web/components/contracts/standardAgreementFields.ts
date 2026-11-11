/**
 * Guided completion form for the Pacten Standard Transaction Agreement.
 * One entry per FORM placeholder in the template (77 fields). AUTO-FILL /
 * PREFILL / SYSTEM-AT-SIGNING placeholders are NOT listed here: user IDs
 * and emails are filled by the server, signature blocks are recorded at
 * signing, and AGREEMENT ID / DATE are system values.
 *
 * Keys are placeholder keys (see api/src/contracts/
 * standard-agreement.template.ts placeholderKey()). Display names are
 * NEVER auto-filled as legal names — the legal-name fields start empty
 * and must be confirmed by the user.
 */

export type AgreementFieldType = 'text' | 'textarea' | 'select' | 'date';

export interface AgreementField {
  /** Placeholder key, e.g. PARTY_A_LEGAL_NAME. */
  key: string;
  label: string;
  section: string;
  type: AgreementFieldType;
  options?: string[];
  required?: boolean;
  /** Shown only when the transaction type is goods or both; renders as
   * "Not applicable" for services-only agreements. */
  goodsOnly?: boolean;
  /** Auto-filled value, shown read-only (user ID / email). */
  readOnly?: boolean;
  /** Prefill source from the GET /contracts/from-deal/:id/prefill payload. */
  prefill?: string;
  hint?: string;
}

export const AGREEMENT_SECTIONS = [
  'Transaction',
  'Party A — Client / Buyer',
  'Party B — Provider / Seller',
  'Description and scope',
  'Dates, times and delivery',
  'Delivery of goods',
  'Price and payment',
  'Review, acceptance and revisions',
  'Intellectual property and usage rights',
  'Confidentiality',
  'Cancellation and termination',
  'Disputes',
  'Liability',
  'Events outside the parties’ control',
  'Governing law and jurisdiction',
  'General',
] as const;

export const STANDARD_AGREEMENT_FIELDS: AgreementField[] = [
  // Transaction (asked first — it drives the conditional goods section)
  {
    key: 'GOODS_SERVICES_BOTH',
    label: 'Transaction type',
    section: 'Transaction',
    type: 'select',
    options: ['goods', 'services', 'both'],
    required: true,
    hint: 'Choose what this agreement covers. Goods-only sections appear only for goods or both.',
  },
  {
    key: 'TRANSACTION_REGION',
    label: 'Transaction location or region',
    section: 'Transaction',
    type: 'text',
  },
  {
    key: 'GOVERNING_JURISDICTION',
    label: 'Governing law',
    section: 'Transaction',
    type: 'text',
    hint: 'Also used in §13.1 (governing law).',
  },

  // §1 Party A — the brand (client / buyer)
  {
    key: 'PARTY_A_LEGAL_NAME',
    label: 'Legal name',
    section: 'Party A — Client / Buyer',
    type: 'text',
    required: true,
    hint: 'Your legal name — not auto-filled from your display name. Please confirm it.',
  },
  {
    key: 'PARTY_A_BUSINESS_NAME',
    label: 'Business name (if applicable)',
    section: 'Party A — Client / Buyer',
    type: 'text',
  },
  {
    key: 'PARTY_A_USER_ID',
    label: 'Pacten user ID',
    section: 'Party A — Client / Buyer',
    type: 'text',
    readOnly: true,
    prefill: 'brandUserId',
  },
  {
    key: 'PARTY_A_EMAIL',
    label: 'Email address',
    section: 'Party A — Client / Buyer',
    type: 'text',
    readOnly: true,
    prefill: 'brandEmail',
  },
  {
    key: 'PARTY_A_ADDRESS',
    label: 'Business or residential address',
    section: 'Party A — Client / Buyer',
    type: 'textarea',
  },
  {
    key: 'PARTY_A_COUNTRY',
    label: 'Country',
    section: 'Party A — Client / Buyer',
    type: 'text',
  },
  {
    key: 'PARTY_A_CONTACT_DETAILS',
    label: 'Contact details',
    section: 'Party A — Client / Buyer',
    type: 'text',
  },

  // §1 Party B — the creator (provider / seller)
  {
    key: 'PARTY_B_LEGAL_NAME',
    label: 'Legal name',
    section: 'Party B — Provider / Seller',
    type: 'text',
    required: true,
    hint: 'The other party’s legal name — not auto-filled from their display name. Please confirm it.',
  },
  {
    key: 'PARTY_B_BUSINESS_NAME',
    label: 'Business name (if applicable)',
    section: 'Party B — Provider / Seller',
    type: 'text',
  },
  {
    key: 'PARTY_B_USER_ID',
    label: 'Pacten user ID',
    section: 'Party B — Provider / Seller',
    type: 'text',
    readOnly: true,
    prefill: 'creatorUserId',
  },
  {
    key: 'PARTY_B_EMAIL',
    label: 'Email address',
    section: 'Party B — Provider / Seller',
    type: 'text',
    readOnly: true,
    prefill: 'creatorEmail',
  },
  {
    key: 'PARTY_B_ADDRESS',
    label: 'Business or residential address',
    section: 'Party B — Provider / Seller',
    type: 'textarea',
  },
  {
    key: 'PARTY_B_COUNTRY',
    label: 'Country',
    section: 'Party B — Provider / Seller',
    type: 'text',
  },
  {
    key: 'PARTY_B_CONTACT_DETAILS',
    label: 'Contact details',
    section: 'Party B — Provider / Seller',
    type: 'text',
  },

  // §2 Description and scope
  {
    key: 'TRANSACTION_CATEGORY',
    label: 'Transaction category',
    section: 'Description and scope',
    type: 'text',
  },
  {
    key: 'DETAILED_DESCRIPTION',
    label: 'Description of goods and/or services',
    section: 'Description and scope',
    type: 'textarea',
    prefill: 'description',
  },
  { key: 'QUANTITY', label: 'Quantity', section: 'Description and scope', type: 'text' },
  {
    key: 'UNIT_OF_MEASUREMENT',
    label: 'Unit of measurement',
    section: 'Description and scope',
    type: 'text',
  },
  {
    key: 'SPECIFICATIONS',
    label: 'Specifications or requirements',
    section: 'Description and scope',
    type: 'textarea',
  },
  {
    key: 'DELIVERABLES',
    label: 'Expected deliverables',
    section: 'Description and scope',
    type: 'textarea',
    prefill: 'deliverables',
  },
  {
    key: 'QUALITY_STANDARDS',
    label: 'Quality standards',
    section: 'Description and scope',
    type: 'textarea',
  },
  {
    key: 'INTENDED_USE',
    label: 'Purpose or intended use',
    section: 'Description and scope',
    type: 'textarea',
  },
  {
    key: 'SPECIAL_INSTRUCTIONS',
    label: 'Special instructions',
    section: 'Description and scope',
    type: 'textarea',
  },

  // §3 Dates, times and delivery
  { key: 'START_DATE', label: 'Agreement start date', section: 'Dates, times and delivery', type: 'date' },
  { key: 'START_TIME', label: 'Start time', section: 'Dates, times and delivery', type: 'text' },
  { key: 'TIME_ZONE', label: 'Time zone', section: 'Dates, times and delivery', type: 'text' },
  {
    key: 'COMPLETION_DATE',
    label: 'Completion or delivery date',
    section: 'Dates, times and delivery',
    type: 'date',
    prefill: 'deadline',
  },
  {
    key: 'COMPLETION_TIME',
    label: 'Completion or delivery time',
    section: 'Dates, times and delivery',
    type: 'text',
  },
  {
    key: 'DELIVERY_LOCATION',
    label: 'Delivery or performance location',
    section: 'Dates, times and delivery',
    type: 'text',
  },
  {
    key: 'DELIVERY_METHOD',
    label: 'Delivery method',
    section: 'Dates, times and delivery',
    type: 'text',
  },
  {
    key: 'MILESTONE_DETAILS',
    label: 'Milestones',
    section: 'Dates, times and delivery',
    type: 'textarea',
  },
  { key: 'END_DATE', label: 'Agreement end date', section: 'Dates, times and delivery', type: 'date' },

  // §3.3 Delivery of goods — conditional on transaction type
  {
    key: 'SHIPPING_RESPONSIBILITY',
    label: 'Shipping responsibility',
    section: 'Delivery of goods',
    type: 'text',
    goodsOnly: true,
  },
  {
    key: 'SHIPPING_COSTS',
    label: 'Shipping costs',
    section: 'Delivery of goods',
    type: 'text',
    goodsOnly: true,
  },
  {
    key: 'CUSTOMS_RESPONSIBILITY',
    label: 'Customs and import responsibility',
    section: 'Delivery of goods',
    type: 'text',
    goodsOnly: true,
  },
  {
    key: 'OWNERSHIP_TRANSFER_POINT',
    label: 'Transfer of ownership',
    section: 'Delivery of goods',
    type: 'text',
    goodsOnly: true,
  },
  {
    key: 'RISK_TRANSFER_POINT',
    label: 'Transfer of risk of loss',
    section: 'Delivery of goods',
    type: 'text',
    goodsOnly: true,
  },

  // §4 Price and payment
  {
    key: 'TOTAL_PRICE',
    label: 'Total transaction price',
    section: 'Price and payment',
    type: 'text',
    prefill: 'agreedBudget',
  },
  {
    key: 'CURRENCY',
    label: 'Currency',
    section: 'Price and payment',
    type: 'text',
    prefill: 'currency',
  },
  {
    key: 'FIXED_PRICE_HOURLY_PER_UNIT_MILESTONE',
    label: 'Pricing basis',
    section: 'Price and payment',
    type: 'select',
    options: ['Fixed price', 'Hourly', 'Per unit', 'Milestone'],
  },
  { key: 'TAX_DETAILS', label: 'Applicable taxes', section: 'Price and payment', type: 'text' },
  {
    key: 'DEPOSIT_AMOUNT',
    label: 'Deposit or upfront payment',
    section: 'Price and payment',
    type: 'text',
  },
  {
    key: 'BALANCE_AMOUNT',
    label: 'Remaining balance',
    section: 'Price and payment',
    type: 'text',
  },
  { key: 'PAYMENT_METHOD', label: 'Payment method', section: 'Price and payment', type: 'text' },
  {
    key: 'PAYMENT_DUE_DATE',
    label: 'Payment due date',
    section: 'Price and payment',
    type: 'date',
  },
  {
    key: 'PAYMENT_MILESTONES',
    label: 'Payment milestones',
    section: 'Price and payment',
    type: 'textarea',
  },
  {
    key: 'PAYMENT_RELEASE_CONDITIONS',
    label: 'Payment release conditions',
    section: 'Price and payment',
    type: 'textarea',
  },
  {
    key: 'FEE_ALLOCATION',
    label: 'Agreed fee allocation (if applicable)',
    section: 'Price and payment',
    type: 'text',
    hint: 'Platform fees are otherwise governed by the Pacten Platform Terms.',
  },

  // §5 Review, acceptance and revisions
  {
    key: 'REVIEW_PERIOD',
    label: 'Review period',
    section: 'Review, acceptance and revisions',
    type: 'text',
  },
  {
    key: 'ACCEPTANCE_CRITERIA',
    label: 'Acceptance criteria',
    section: 'Review, acceptance and revisions',
    type: 'textarea',
  },
  {
    key: 'NUMBER_OF_REVISIONS',
    label: 'Included revisions',
    section: 'Review, acceptance and revisions',
    type: 'text',
  },
  {
    key: 'REVISION_DEADLINE',
    label: 'Revision deadline',
    section: 'Review, acceptance and revisions',
    type: 'date',
  },

  // §7 Intellectual property and usage rights
  {
    key: 'OWNERSHIP_ARRANGEMENT',
    label: 'Ownership arrangement',
    section: 'Intellectual property and usage rights',
    type: 'textarea',
    prefill: 'ownershipArrangement',
    hint: 'Template default: unless a different arrangement is agreed, the provider retains ownership and grants a non-exclusive licence once paid. Clear the field to keep the template default.',
  },
  {
    key: 'INCLUDED_RIGHTS',
    label: 'Included rights',
    section: 'Intellectual property and usage rights',
    type: 'textarea',
  },
  {
    key: 'USAGE_TERRITORY',
    label: 'Usage territory',
    section: 'Intellectual property and usage rights',
    type: 'text',
  },
  {
    key: 'USAGE_DURATION',
    label: 'Usage duration',
    section: 'Intellectual property and usage rights',
    type: 'text',
  },
  {
    key: 'PERMITTED_PLATFORMS',
    label: 'Permitted platforms or channels',
    section: 'Intellectual property and usage rights',
    type: 'text',
  },
  {
    key: 'EXCLUSIVITY_TERMS',
    label: 'Exclusivity',
    section: 'Intellectual property and usage rights',
    type: 'text',
  },
  {
    key: 'ATTRIBUTION_REQUIREMENTS',
    label: 'Credit or attribution requirements',
    section: 'Intellectual property and usage rights',
    type: 'text',
  },
  {
    key: 'DISCLOSURE_REQUIREMENTS',
    label: 'Required advertising disclosures',
    section: 'Intellectual property and usage rights',
    type: 'textarea',
  },
  {
    key: 'CONTENT_APPROVAL_PROCESS',
    label: 'Content approval process',
    section: 'Intellectual property and usage rights',
    type: 'textarea',
  },
  {
    key: 'PUBLICATION_SCHEDULE',
    label: 'Content publication schedule',
    section: 'Intellectual property and usage rights',
    type: 'textarea',
  },

  // §8 Confidentiality
  {
    key: 'CONFIDENTIALITY_PERIOD',
    label: 'Confidentiality duration',
    section: 'Confidentiality',
    type: 'text',
  },

  // §9 Cancellation and termination
  {
    key: 'CANCELLATION_NOTICE_PERIOD',
    label: 'Cancellation notice period',
    section: 'Cancellation and termination',
    type: 'text',
  },
  {
    key: 'CANCELLATION_FEE',
    label: 'Cancellation fee (if applicable)',
    section: 'Cancellation and termination',
    type: 'text',
  },
  {
    key: 'REFUND_TERMS',
    label: 'Refund terms',
    section: 'Cancellation and termination',
    type: 'textarea',
  },
  {
    key: 'PARTIAL_WORK_PAYMENT_TERMS',
    label: 'Treatment of partially completed work',
    section: 'Cancellation and termination',
    type: 'textarea',
  },
  {
    key: 'BREACH_REMEDY_PERIOD',
    label: 'Breach remedy period',
    section: 'Cancellation and termination',
    type: 'text',
  },

  // §10 Disputes
  {
    key: 'MEDIATION_ARRANGEMENT',
    label: 'Optional mediation arrangement',
    section: 'Disputes',
    type: 'textarea',
  },

  // §11 Liability
  {
    key: 'LIABILITY_CAP',
    label: 'Agreed liability cap (if applicable)',
    section: 'Liability',
    type: 'text',
  },

  // §12 Events outside the parties' control
  {
    key: 'DISRUPTION_PERIOD',
    label: 'Extended disruption period',
    section: 'Events outside the parties’ control',
    type: 'text',
  },

  // §13 Governing law and jurisdiction
  {
    key: 'DISPUTE_COURT_LOCATION',
    label: 'Court location',
    section: 'Governing law and jurisdiction',
    type: 'text',
  },
  {
    key: 'EXCLUSIVE_NON_EXCLUSIVE',
    label: 'Court jurisdiction type',
    section: 'Governing law and jurisdiction',
    type: 'select',
    options: ['Exclusive', 'Non-exclusive'],
  },

  // §14 General
  {
    key: 'NOTICE_REQUIREMENTS',
    label: 'Additional notice requirements',
    section: 'General',
    type: 'textarea',
  },
];

/** Fields visible for a given transaction type (goods-only fields hide for services). */
export function visibleAgreementFields(
  transactionType: string,
): AgreementField[] {
  const showGoods = transactionType === 'goods' || transactionType === 'both';
  return STANDARD_AGREEMENT_FIELDS.filter(
    (f) => !f.goodsOnly || showGoods,
  );
}
