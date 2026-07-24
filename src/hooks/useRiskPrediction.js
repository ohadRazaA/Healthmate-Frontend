import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useFetchData } from "./useFetchData";
import apiEndPoints, { BASE_URL } from "../constants/apiEndpoints";

function authHeaders() {
  const token = Cookies.get("token");
  return { Authorization: `Bearer ${token}` };
}

/**
 * Latest prediction for the current user. Polls every 3s while a prediction is "pending" —
 * same refetchInterval-while-processing pattern ReportViewer uses for report analysis — and
 * stops as soon as it lands on "completed" or "failed".
 */
export function useLatestPrediction() {
  return useFetchData(
    "latest-prediction",
    `${BASE_URL}${apiEndPoints.getLatestPrediction}`,
    {},
    authHeaders(),
    {
      refetchInterval: (query) => (query.state.data?.data?.status === "pending" ? 3000 : false),
    }
  );
}

/**
 * Triggers a new prediction (POST /predict). Returns either the completed result (fast path,
 * ~99% of calls) or a 202-accepted pending record (slow path — the backend fell back to
 * background completion). Either way, invalidating "latest-prediction" afterwards is enough:
 * a completed result shows immediately from cache, a pending one starts the poll above.
 */
export function useTriggerPrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vitalId) => {
      const res = await fetch(`${BASE_URL}${apiEndPoints.predict}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(vitalId ? { vitalId } : {}),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok && res.status !== 202) {
        throw new Error(json?.message || "Could not start prediction.");
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["latest-prediction"] });
    },
  });
}

/** Saved risk-chat conversation for the current user (persists across page loads). */
export function useRiskChatHistory() {
  return useFetchData(
    "risk-chat-history",
    `${BASE_URL}${apiEndPoints.riskChatHistory}`,
    {},
    authHeaders()
  );
}

/**
 * Sends a risk-panel chat message with dual context (latest vitals are always used server-side;
 * reportId here is the currently-selected report, or undefined for vitals-only).
 */
export function useSendRiskChatMessage() {
  return useMutation({
    mutationFn: async ({ question, reportId }) => {
      const res = await fetch(`${BASE_URL}${apiEndPoints.riskChatQuery}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ question, reportId: reportId || undefined }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(json?.message || "Could not get a reply.");
        err.status = res.status;
        throw err;
      }
      return json;
    },
  });
}
