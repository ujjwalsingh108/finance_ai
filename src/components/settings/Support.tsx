import { FeedbackForm } from "@/components/settings/FeedbackForm";

export function Support() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="text-xl font-semibold">Feedback</div>
        <FeedbackForm />
      </div>
    </div>
  );
}
