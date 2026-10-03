import "server-only";

/**
 * Privacy-conscious product analytics. Only event names and coarse,
 * non-identifying properties are allowed; resume text never leaves the app.
 * Wire a provider (PostHog, Plausible, etc.) inside `dispatch`.
 */
export type AnalyticsEvent =
  | "resume_created"
  | "resume_imported"
  | "resume_duplicated"
  | "template_selected"
  | "resume_exported"
  | "public_resume_created"
  | "public_resume_disabled"
  | "resume_deleted"
  | "user_signed_up";

type Props = Partial<{
  templateId: string;
  source: "scratch" | "import" | "duplicate" | "onboarding" | "demo";
  format: "pdf" | "docx" | "txt";
  visibility: string;
  sectionCount: number;
}>;

export function track(event: AnalyticsEvent, userId: string, props: Props = {}): void {
  void dispatch({ event, userId, props, at: new Date().toISOString() });
}

async function dispatch(payload: { event: AnalyticsEvent; userId: string; props: Props; at: string }) {
  if (process.env.ANALYTICS_DEBUG === "true") {
    console.info("[analytics]", payload.event, payload.props);
  }
  // TODO: forward `payload` to the configured analytics provider.
}
