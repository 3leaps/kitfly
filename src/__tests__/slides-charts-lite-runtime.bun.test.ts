import { expect, test } from "bun:test";

type ChartsLiteHooks = {
	parseSpec: (text: string) => {
		kind: string;
		labels: string[];
		data: number[];
		title: string;
		color: string;
		height: number;
	} | null;
};

async function loadHooks(): Promise<ChartsLiteHooks> {
	// @ts-expect-error JS plugin helper file
	await import("../../plugins-dist/slides-charts-lite-runtime.js");
	const hooks = (globalThis as any).__kitflyChartsLiteTest as ChartsLiteHooks | undefined;
	if (!hooks) throw new Error("slides-charts-lite test hooks not found on globalThis");
	return hooks;
}

test("slides-charts-lite: parses valid chart block", async () => {
	const hooks = await loadHooks();
	const spec = hooks.parseSpec(`kind: bar\nlabels: ["Q1","Q2"]\ndata: [10, 20]\nheight: 400`);
	expect(spec).toEqual({
		kind: "bar",
		labels: ["Q1", "Q2"],
		data: [10, 20],
		title: "",
		color: "primary",
		height: 400,
	});
});

test("slides-charts-lite: rejects mismatched labels/data", async () => {
	const hooks = await loadHooks();
	const spec = hooks.parseSpec(`kind: line\nlabels: ["A","B"]\ndata: [1]`);
	expect(spec).toBeNull();
});

test("slides-charts-lite: rejects unknown kind", async () => {
	const hooks = await loadHooks();
	const spec = hooks.parseSpec(`kind: scatter\nlabels: ["A"]\ndata: [1]`);
	expect(spec).toBeNull();
});
