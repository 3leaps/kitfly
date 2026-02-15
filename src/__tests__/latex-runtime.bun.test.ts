import { expect, test } from "bun:test";

type LatexHooks = {
	splitMath: (text: string) => Array<{ text?: string; math?: string; display?: boolean }>;
	isCurrency: (expr: string) => boolean;
	shouldTreatAsLiteralInline: (expr: string, text: string, closingIndex: number) => boolean;
};

async function loadHooks(): Promise<LatexHooks> {
	// @ts-expect-error JS plugin helper file
	await import("../../plugins-dist/latex-runtime.js");
	const hooks = (globalThis as any).__kitflyLatexTest as LatexHooks | undefined;
	if (!hooks) throw new Error("latex test hooks not found on globalThis");
	return hooks;
}

test("latex: parses inline math", async () => {
	const hooks = await loadHooks();
	expect(hooks.splitMath("A $x^2$ value")).toEqual([
		{ text: "A " },
		{ math: "x^2", display: false },
		{ text: " value" },
	]);
});

test("latex: treats $5-$10 as literal currency range", async () => {
	const hooks = await loadHooks();
	expect(hooks.splitMath("$5-$10")).toEqual([{ text: "$5-$10" }]);
});

test("latex: currency helper matches dashed ranges", async () => {
	const hooks = await loadHooks();
	expect(hooks.isCurrency("5-10")).toBe(true);
	expect(hooks.isCurrency("5 to 10")).toBe(true);
});
