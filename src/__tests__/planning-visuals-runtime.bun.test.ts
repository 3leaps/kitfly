import { expect, test } from "bun:test";

type PlanningVisualsHooks = {
	parseFence: (text: string) => { type: string; data: Record<string, unknown> } | null;
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
