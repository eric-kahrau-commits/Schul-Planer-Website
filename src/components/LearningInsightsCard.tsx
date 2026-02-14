"use client";

import { useStore } from "@/lib/store";
import { computeLearningInsights, type LearningInsight } from "@/lib/learningInsights";

function InsightItem({ insight }: { insight: LearningInsight }) {
  const isPositive = insight.type === "good_balance";
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 text-sm ${
        isPositive
          ? "border-study-sage/50 bg-study-mint/20 text-study-ink"
          : "border-study-border bg-study-cream/50 text-study-ink"
      }`}
    >
      {insight.subjectName && (
        <span className="font-medium text-study-sage">{insight.subjectName}: </span>
      )}
      {insight.message}
    </div>
  );
}

export function LearningInsightsCard() {
  const { sessions, subjects, getSessionsForDate } = useStore();
  const insights = computeLearningInsights(sessions, subjects, getSessionsForDate);

  if (insights.length === 0) return null;

  return (
    <div className="card border-study-sage/30 bg-study-cream/30">
      <h2 className="mb-3 text-base font-medium text-study-ink">
        Lern-Coach
      </h2>
      <div className="space-y-2">
        {insights.slice(0, 2).map((insight, i) => (
          <InsightItem key={`${insight.type}-${insight.subjectId ?? i}`} insight={insight} />
        ))}
      </div>
    </div>
  );
}
