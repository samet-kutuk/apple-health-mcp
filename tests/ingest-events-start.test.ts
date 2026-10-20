import { describe, it, expect } from "vitest";
import { normalize } from "@/lib/ingest";

const empty = { metrics: [], workouts: [], ecg: [], stateOfMind: [], symptoms: [], medications: [], cycleTracking: [], heartRateNotifications: [] };

describe("normalize events with start/end", () => {
  it("stores State of Mind entries that use ISO start/end", () => {
    const r = normalize({ data: { ...empty, stateOfMind: [
      { id: "x", start: "2026-10-17T09:15:00Z", end: "2026-10-17T09:16:00Z", kind: "momentary_emotion", valence: 0.4 },
    ] } } as any);
    expect(r.skipped).toBe(0);
    expect(r.eventRows).toHaveLength(1);
    expect(r.eventRows[0].date.toISOString()).toBe("2026-10-17T09:15:00.000Z");
  });

  it("stores symptoms, ECG and heart rate notifications that use HAE-format start", () => {
    const S = "2026-10-17 08:00:00 +0200";
    const r = normalize({ data: { ...empty,
      symptoms: [{ start: S, end: S, name: "Fatigue" }],
      ecg: [{ start: S, end: S, classification: "Sinus Rhythm" }],
      heartRateNotifications: [{ start: S, end: S, threshold: 100 }],
    } } as any);
    expect(r.skipped).toBe(0);
    expect(r.eventRows).toHaveLength(3);
    expect(r.eventRows[0].date.toISOString()).toBe("2026-10-17T06:00:00.000Z");
  });

  it("still skips entries with no usable date", () => {
    const r = normalize({ data: { ...empty, symptoms: [{ name: "x" }, { start: "not a date" }] } } as any);
    expect(r.skipped).toBe(2);
  });
});
