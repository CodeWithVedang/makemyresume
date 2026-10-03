import type { Metadata } from "next";

import { PricingPlans } from "@/components/billing/PricingPlans";
import { Reveal } from "@/components/landing/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import type { PlanRequester } from "@/lib/billing/plan-request";
import { PLAN_ORDER, PLANS } from "@/lib/billing/plans";
import { APP_NAME, appUrl } from "@/lib/config";
import { getAccountUsage } from "@/server/entitlements";
import { getCurrentUser } from "@/server/session";

export const metadata: Metadata = {
  title: "Pricing — Free Resume Maker, Plans from ₹99",
  description: `${APP_NAME} is free for your first resume. Need more? One-time plans from ₹99 with all templates, unlimited resumes and shareable links. No auto-renewal.`,
  alternates: { canonical: "/pricing" },
};

const FAQ = [
  {
    q: "Is it really free?",
    a: "Yes. Your first resume is free forever, including PDF downloads, import from Word or PDF, three ATS-friendly templates and 3 shareable links.",
  },
  {
    q: "Will I be charged automatically?",
    a: "No. Every plan is a one-time payment. There is no auto-renewal or mandate. When a plan ends you go back to Free and keep all your resumes.",
  },
  {
    q: "How do I pay?",
    a: "Online checkout is coming soon. For now, choose a plan and send the pre-filled email. We reply with UPI or bank transfer details and activate your plan once payment is confirmed.",
  },
  {
    q: "Which plan should I pick?",
    a: "Freshers and students making one resume can stay on Free. Applying to a few different roles this month? Take the Job Pass. For a placement season or a job switch, Pro for 3 months is the best fit.",
  },
  {
    q: "What happens to my resumes if my plan ends?",
    a: "Nothing is deleted. You can still open, edit and download every resume. Creating new resumes and links follows the Free limits again.",
  },
];

export default async function PricingPage() {
  const user = await getCurrentUser();
  let requester: PlanRequester | null = null;
  if (user) {
    const usage = await getAccountUsage(user.id);
    requester = { name: user.name, email: user.email, currentPlan: usage.plan, resumes: usage.resumes };
  }

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-[480px]" />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-brand">Simple, honest pricing</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            Start free. Upgrade only when you need more.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your first resume is free forever. Paid plans cost less than a movie ticket and never auto-renew.
          </p>
        </Reveal>

        <div className="mt-14">
          <PricingPlans requester={requester} />
        </div>

        <section aria-labelledby="faq-title" className="mx-auto mt-24 max-w-3xl">
          <h2 id="faq-title" className="text-center text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: APP_NAME,
          description: "Online resume maker with ATS-friendly templates and PDF export.",
          url: `${appUrl()}/pricing`,
          offers: PLAN_ORDER.map((id) => ({
            "@type": "Offer",
            name: PLANS[id].name,
            price: PLANS[id].priceInr,
            priceCurrency: "INR",
          })),
        }}
      />
    </div>
  );
}
