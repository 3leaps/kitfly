import { expect, test } from "bun:test";

type PlanningVisualsHooks = {
	parseFence: (text: string) => { type: string; data: Record<string, unknown> } | null;
	buildAxisCellLabel: (
		unit: string,
		info: { year: number; week?: number; month?: number; label: string },
		prev: { year: number; week?: number; month?: number; label: string } | null,
		index: number,
		totalUnits: number,
	) => string;
	weekLabelStepForUnits: (totalUnits: number) => number;
	weekAxisContextLabel: (
		startInfo: { year: number; week: number; label: string },
		endInfo: { year: number; week: number; label: string },
	) => string;
	parseMarkerPosition: (value: string, unit: string) => number | null;
	parseUnitOrdinal: (value: string, unit: string) => number | null;
	weekLabelFromOrdinal: (ordinal: number) => { year: number; week: number; label: string };
	monthLabelFromOrdinal: (ordinal: number) => { year: number; month: number; label: string };
};

async function loadHooks(): Promise<PlanningVisualsHooks> {
	// @ts-expect-error JS plugin registers test hooks on globalThis in non-DOM environments.
	await import("../../plugins-dist/planning-visuals.js");
	const hooks = (globalThis as any).__kitflyPlanningVisualsTest as PlanningVisualsHooks | undefined;
	if (!hooks) throw new Error("planning-visuals test hooks not found on globalThis");
	return hooks;
}

test("planning-visuals: week roundtrip keeps same label", async () => {
	const hooks = await loadHooks();
	const ordinal = hooks.parseUnitOrdinal("2026-W14", "week");
	expect(ordinal).not.toBeNull();
	const label = hooks.weekLabelFromOrdinal(ordinal as number);
	expect(label.label).toBe("W14");
	expect(label.year).toBe(2026);
});

test("planning-visuals: week boundary label resolves correct year", async () => {
	const hooks = await loadHooks();
	const ordinal = hooks.parseUnitOrdinal("2027-W01", "week");
	expect(ordinal).not.toBeNull();
	const label = hooks.weekLabelFromOrdinal(ordinal as number);
	expect(label.label).toBe("W01");
	expect(label.year).toBe(2027);
});

test("planning-visuals: compact week axis uses sparse full week labels", async () => {
	const hooks = await loadHooks();
	expect(hooks.weekLabelStepForUnits(28)).toBe(4);
	const first = hooks.weekLabelFromOrdinal(hooks.parseUnitOrdinal("2026-W10", "week") as number);
	const interior = hooks.weekLabelFromOrdinal(
		(hooks.parseUnitOrdinal("2026-W10", "week") as number) + 4,
	);
	const firstText = hooks.buildAxisCellLabel("week", first, null, 0, 28);
	const interiorText = hooks.buildAxisCellLabel("week", interior, first, 4, 28);
	expect(firstText.startsWith("W10")).toBe(true);
	expect(interiorText).toBe("W14");
});

test("planning-visuals: week axis context label is explicit for audience clarity", async () => {
	const hooks = await loadHooks();
	const start = hooks.weekLabelFromOrdinal(hooks.parseUnitOrdinal("2026-W10", "week") as number);
	const end = hooks.weekLabelFromOrdinal(hooks.parseUnitOrdinal("2026-W36", "week") as number);
	const context = hooks.weekAxisContextLabel(start, end);
	expect(context).toBe("ISO Weeks W10-W36 (2026)");
});

test("planning-visuals: parseFence preserves interleaved row order from repeated lists", async () => {
	const hooks = await loadHooks();
	const parsed = hooks.parseFence(
		`:::gantt
+time-unit: week
+time-start: 2026-W14
+time-end: 2026-W20
+tracks:
+  - label: Wave 1
+    depth: 1
+    start: 2026-W14
+    end: 2026-W16
+milestones:
+  - label: Go/No-Go
+    date: 2026-W15
+tracks:
+  - label: Wave 2
+    depth: 1
+    start: 2026-W17
+    end: 2026-W20
+:::`.replace(/^\+/gm, ""),
	);

	expect(parsed?.type).toBe("gantt");
	const order = (parsed?.data.__rowOrder as Array<{ kind: string; index: number }>) || [];
	expect(order).toEqual([
		{ kind: "track", index: 0 },
		{ kind: "milestone", index: 0 },
		{ kind: "track", index: 1 },
	]);
});

test("planning-visuals: parseFence parses markers list", async () => {
	const hooks = await loadHooks();
	const parsed = hooks.parseFence(
		`:::gantt
+time-unit: week
+time-start: 2026-W14
+time-end: 2026-W30
+markers:
+  - label: Go/No-Go
+    date: 2026-W20
+  - label: Phase Gate
+    date: 2026-W28
+tracks:
+  - label: Phase 1
+    depth: 1
+    start: 2026-W14
+    end: 2026-W24
+:::`.replace(/^\+/gm, ""),
	);

	expect(parsed?.type).toBe("gantt");
	const markers = parsed?.data.markers as Array<Record<string, string>>;
	expect(markers).toHaveLength(2);
	expect(markers[0].label).toBe("Go/No-Go");
	expect(markers[0].date).toBe("2026-W20");
	expect(markers[1].label).toBe("Phase Gate");
	expect(markers[1].date).toBe("2026-W28");
});

test("planning-visuals: marker parser supports day precision in month mode", async () => {
	const hooks = await loadHooks();
	const monthCenter = hooks.parseMarkerPosition("2026-05", "month");
	const monthDay = hooks.parseMarkerPosition("2026-05-26", "month");
	expect(monthCenter).not.toBeNull();
	expect(monthDay).not.toBeNull();
	expect(monthDay as number).toBeGreaterThan(monthCenter as number);
	expect(hooks.parseMarkerPosition("2026-02-30", "month")).toBeNull();
});
