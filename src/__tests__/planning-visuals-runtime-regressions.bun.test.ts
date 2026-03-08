import { expect, test } from "bun:test";

type PlanningVisualsRegressionHooks = {
	parseGanttNodesWithFirstLines: (
		firstLines: string[],
		between: any[],
		endNode: any,
	) => Record<string, unknown>;
};

class FakeElement {
	tagName: string;
	textContent: string;
	#children: FakeElement[];

	constructor(tagName: string, textContent = "", children: FakeElement[] = []) {
		this.tagName = tagName;
		this.textContent = textContent;
		this.#children = children;
	}

	querySelectorAll(selector: string): FakeElement[] {
		if (selector === ":scope > li") return this.#children;
		if (selector === ":scope > p") return [];
		return [];
	}
}

async function loadHooks(): Promise<PlanningVisualsRegressionHooks> {
	// @ts-expect-error JS plugin registers test hooks on globalThis in non-DOM environments.
	await import("../../plugins-dist/planning-visuals.js");
	const hooks = (globalThis as any).__kitflyPlanningVisualsTest as
		| PlanningVisualsRegressionHooks
		| undefined;
	if (!hooks) throw new Error("planning-visuals test hooks not found on globalThis");
	return hooks;
}

test("planning-visuals: fragmented list-key switch preserves markers and milestones", async () => {
	const { parseGanttNodesWithFirstLines } = await loadHooks();
	const data = parseGanttNodesWithFirstLines(
		['time-unit: "month"', 'time-start: "2026-03"', 'time-end: "2026-09"', "markers:"],
		[],
		new FakeElement("UL", "", [
			new FakeElement("LI", 'label: "P66 Conf (May 26)"\ndate: "2026-05"\ntracks:'),
			new FakeElement(
				"LI",
				'label: "Wave 1"\ndepth: 1\nstart: "2026-03"\nend: "2026-04"\nmilestones:',
			),
			new FakeElement("LI", 'label: "Auto Go-Live May 19"\ndate: "2026-05"\ntracks:'),
			new FakeElement("LI", 'label: "Wave 2"\ndepth: 1\nstart: "2026-05"\nend: "2026-06"'),
		]),
	);

	const markers = data.markers as Array<Record<string, string>>;
	const tracks = data.tracks as Array<Record<string, string>>;
	const milestones = data.milestones as Array<Record<string, string>>;

	expect(markers).toHaveLength(1);
	expect(markers[0].label).toBe("P66 Conf (May 26)");

	expect(milestones).toHaveLength(1);
	expect(milestones[0].label).toBe("Auto Go-Live May 19");

	expect(tracks).toHaveLength(2);
	expect(tracks[0].label).toBe("Wave 1");
	expect(tracks[1].label).toBe("Wave 2");
});
