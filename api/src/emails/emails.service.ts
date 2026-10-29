import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Transactional emails (M4 — Admin, Disputes & Notifications). Provider:
 * Resend (client-owned account). Without RESEND_API_KEY the service runs
 * in log-only mode — templates are still built and every send is logged,
 * so flows can be verified locally. Set EMAIL_FROM to override the
 * default sender (sending domain pacten.info, verified in Resend).
 */
@Injectable()
export class EmailsService {
  private readonly logger = new Logger('Emails');
  private readonly apiKey: string;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get('RESEND_API_KEY', '');
    this.from = this.config.get('EMAIL_FROM', 'Pacten <hello@pacten.info>');
    this.frontendUrl = this.config
      .get('FRONTEND_URL', 'http://localhost:3000')
      .replace(/\/$/, '');
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private layout(title: string, body: string): string {
    return `<!doctype html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
<h2 style="color:#4f46e5;">${title}</h2>
${body}
<hr style="border:none;border-top:1px solid #eee;margin-top:24px;"/>
<p style="font-size:12px;color:#888;">Pacten — pacten.net</p>
</body></html>`;
  }

  private btn(href: string, label: string): string {
    return `<p><a href="${href}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">${label}</a></p>`;
  }

  async send(to: string, subject: string, html: string) {
    if (!to) return { sent: false, reason: 'no_recipient' };
    if (!this.isConfigured()) {
      this.logger.log(
        `[email:log-only] to=${to} subject="${subject}" (set RESEND_API_KEY to send)`,
      );
      return { sent: false, reason: 'not_configured' };
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: this.from, to, subject, html }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        this.logger.error(`[email:failed] to=${to} ${JSON.stringify(data)}`);
        return { sent: false, reason: 'provider_error' };
      }
      return { sent: true, id: data.id };
    } catch (e: any) {
      this.logger.error(`[email:error] to=${to} ${e?.message}`);
      return { sent: false, reason: 'error' };
    }
  }

  sendVerificationEmail(to: string, name: string, token: string) {
    const url = `${this.frontendUrl}/verify?token=${token}`;
    return this.send(
      to,
      'Verify your Pacten email',
      this.layout(
        `Welcome${name ? `, ${name}` : ''}!`,
        `<p>Please verify your email address to activate your Pacten account.</p>${this.btn(url, 'Verify email')}<p style="font-size:12px;color:#888;">Or paste this link: ${url}</p>`,
      ),
    );
  }

  sendPasswordResetEmail(to: string, token: string) {
    const url = `${this.frontendUrl}/reset-password?token=${token}`;
    return this.send(
      to,
      'Reset your Pacten password',
      this.layout(
        'Reset your password',
        `<p>We received a request to reset your Pacten password. Click the button below to choose a new password. This link expires in 1 hour.</p>${this.btn(url, 'Reset password')}<p style="font-size:12px;color:#888;">Or paste this link: ${url}</p><p style="font-size:12px;color:#888;">If you did not request this, you can safely ignore this email.</p>`,
      ),
    );
  }

  sendApplicationReceived(to: string, campaignTitle: string) {
    return this.send(
      to,
      'Application received — Pacten',
      this.layout(
        'Application received',
        `<p>Your application for <strong>${campaignTitle}</strong> was received. The brand will review it shortly.</p>`,
      ),
    );
  }

  sendContractSent(to: string, contractTitle: string, contractId: string) {
    const url = `${this.frontendUrl}/dashboard/contracts/${contractId}`;
    return this.send(
      to,
      'Contract awaiting your signature — Pacten',
      this.layout(
        'Contract sent',
        `<p>A contract <strong>${contractTitle}</strong> is awaiting your signature.</p>${this.btn(url, 'Review contract')}`,
      ),
    );
  }

  sendContractAccepted(to: string, contractTitle: string) {
    return this.send(
      to,
      'Contract signed — Pacten',
      this.layout(
        'Contract signed',
        `<p>The contract <strong>${contractTitle}</strong> has been signed by both parties. The deal is now active.</p>`,
      ),
    );
  }

  sendContractDeclined(to: string, contractTitle: string) {
    return this.send(
      to,
      'Contract declined — Pacten',
      this.layout(
        'Contract declined',
        `<p>The contract <strong>${contractTitle}</strong> was declined by the other party. You can review it in your dashboard and generate a new contract if needed.</p>`,
      ),
    );
  }

  sendPaymentSucceeded(to: string, amount: string, dealTitle: string) {
    return this.send(
      to,
      'Payment received — Pacten',
      this.layout(
        'Payment received',
        `<p>A payment of <strong>${amount}</strong> for <strong>${dealTitle}</strong> was received via Stripe.</p>`,
      ),
    );
  }

  sendPayoutDecided(to: string, amountCents: number, approved: boolean) {
    const amount = `$${(amountCents / 100).toFixed(2)}`;
    return this.send(
      to,
      approved ? 'Referral payout approved — Pacten' : 'Referral payout update — Pacten',
      this.layout(
        approved ? 'Payout approved' : 'Payout not approved',
        approved
          ? `<p>Your referral payout of <strong>${amount}</strong> was approved by admin. The cash transfer will be processed manually.</p>`
          : `<p>Your referral payout request of <strong>${amount}</strong> was not approved. Your referral balance has been restored.</p>`,
      ),
    );
  }

  sendPayoutRequested(to: string, amountCents: number) {
    const amount = `$${(amountCents / 100).toFixed(2)}`;
    return this.send(
      to,
      'Payout request received — Pacten',
      this.layout(
        'Payout request received',
        `<p>Your referral payout request of <strong>${amount}</strong> was received and is pending admin review. Approved payouts are transferred manually.</p>`,
      ),
    );
  }

  sendSubscriptionCancelled(to: string, planName: string, accessUntil?: string) {
    return this.send(
      to,
      'Subscription cancelled — Pacten',
      this.layout(
        'Subscription cancelled',
        `<p>Your <strong>${planName}</strong> subscription has been cancelled.${accessUntil ? ` You will keep access until <strong>${accessUntil}</strong>.` : ''}</p>`,
      ),
    );
  }

  sendDisputeFiled(to: string, disputeId: string, dealId: string) {
    return this.send(
      to,
      'Dispute filed — Pacten',
      this.layout(
        'Dispute filed',
        `<p>Your dispute for deal <strong>${dealId.slice(0, 8)}</strong> was filed and is now open. Our team will review it shortly. (Ref: ${disputeId.slice(0, 8)})</p>`,
      ),
    );
  }

  sendDisputeResolved(to: string, disputeId: string, resolved: boolean) {
    return this.send(
      to,
      resolved ? 'Dispute resolved — Pacten' : 'Dispute closed — Pacten',
      this.layout(
        resolved ? 'Dispute resolved' : 'Dispute closed',
        `<p>Your dispute (ref ${disputeId.slice(0, 8)}) has been ${resolved ? 'resolved' : 'closed'} by our team. You can view the resolution notes in your dashboard.</p>`,
      ),
    );
  }

  sendNewMessage(to: string, senderName: string, preview: string) {
    const excerpt =
      preview.length > 120 ? `${preview.slice(0, 120)}…` : preview;
    const url = `${this.frontendUrl}/dashboard/messages`;
    return this.send(
      to,
      `New message from ${senderName} — Pacten`,
      this.layout(
        'New message',
        `<p><strong>${senderName}</strong> sent you a message:</p><p style="background:#f6f6f6;padding:12px;border-radius:8px;">${excerpt}</p>${this.btn(url, 'View messages')}`,
      ),
    );
  }
}
