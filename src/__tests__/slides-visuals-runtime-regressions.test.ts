import { expect, test } from "bun:test";

type SlidesVisualsTestHooks = {
	parseBodyNodesWithFirstLines: (
		firstLines: string[],
		between: any[],
		end: any,
		type: string,
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

async function loadHooks(): Promise<SlidesVisualsTestHooks> {
	// Executes the plugin file and registers hooks on globalThis (in non-DOM test env).
	await import("../../plugins-dist/slides-visuals.js");
	const hooks = (globalThis as any).__kitflySlidesVisualsTest as SlidesVisualsTestHooks | undefined;
	if (!hooks) throw new Error("slides-visuals test hooks not found on globalThis");
	return hooks;
}

test("slides-visuals: absorbed scalar marker preserves preceding item (compare)", async () => {
	const { parseBodyNodesWithFirstLines } = await loadHooks();

	const out = parseBodyNodesWithFirstLines(
		['left-title: "Build In-House"', "left:"],
		[],
		new FakeElement("UL", "", [
			new FakeElement("LI", "Ongoing maintenance burden\nright-title: Auth0 / Clerk"),
			new FakeElement("LI", "Production-ready in 2 weeks"),
		]),
		"compare",
	);

	expect(out["left-title"]).toBe("Build In-House");
	expect(out["right-title"]).toBe("Auth0 / Clerk");
	expect(out.left).toEqual(["Ongoing maintenance burden"]);
	expect(out.right).toEqual(["Production-ready in 2 weeks"]);
});

test("slides-visuals: absorbed list marker preserves preceding item (comparison-table)", async () => {
	const { parseBodyNodesWithFirstLines } = await loadHooks();

	const out = parseBodyNodesWithFirstLines(
		["headers:"],
		[],
		new FakeElement("UL", "", [
			new FakeElement("LI", "Feature"),
			new FakeElement("LI", "Us"),
			new FakeElement("LI", "Competitor A"),
			new FakeElement("LI", "Competitor B\nrows:"),
			new FakeElement("LI", '["Real-time sync", "Yes", "Yes", "No"]'),
		]),
		"comparison-table",
	);

	expect(out.headers).toEqual(["Feature", "Us", "Competitor A", "Competitor B"]);
	expect(out.rows).toEqual(['["Real-time sync", "Yes", "Yes", "No"]']);
});
