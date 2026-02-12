import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("sidebar folder indicator CSS", () => {
	it("uses chevron + rotate transition for open/close state", async () => {
		const css = await readFile(join(process.cwd(), "src/site/styles.css"), "utf-8");
		expect(css).toContain(".sidebar-nav .nav-group::before");
		expect(css).toContain('content: "›"');
		expect(css).toContain("transition: transform 150ms ease");
		expect(css).toContain(".sidebar-nav details[open] > .nav-group::before");
		expect(css).toContain("transform: rotate(90deg)");
	});
});

describe("slide layout primitives CSS", () => {
	it("includes core block-flow/grid/stack primitives", async () => {
		const css = await readFile(join(process.cwd(), "src/site/styles.css"), "utf-8");
		expect(css).toContain(".block-flow");
		expect(css).toContain(".block-grid");
		expect(css).toContain(".block-stack");
		expect(css).toContain(".block-label");
		expect(css).toContain(".block-flow:not(.vertical) .block:not(:last-child)::after");
		expect(css).toContain(".block-flow.vertical .block:not(:last-child)::after");
		expect(css).toContain(".block-grid.cols-3");
		expect(css).toContain(".block-grid.cols-4");
	});

	it("includes shape modifiers for block visuals", async () => {
		const css = await readFile(join(process.cwd(), "src/site/styles.css"), "utf-8");
		expect(css).toContain(".block.circle");
		expect(css).toContain(".block.pill");
		expect(css).toContain(".block.diamond");
		expect(css).toContain(".block.chevron");
		expect(css).toContain(".block.hexagon");
		expect(css).toContain(".block.triangle");
		expect(css).toContain(".block.block-arrow");
	});

	it("keeps non-active layout-class slides hidden", async () => {
		const css = await readFile(join(process.cwd(), "src/site/styles.css"), "utf-8");
		expect(css).toContain(".slide {");
		expect(css).toContain("display: none;");
		expect(css).toContain(".slide.active.centered");
		expect(css).toContain(".slide.active.two-column");
		expect(css).not.toContain(".slide.centered {\n  min-height: 100%;\n  display: flex;");
		expect(css).not.toContain(".slide.two-column {\n  display: grid;");
	});
});
