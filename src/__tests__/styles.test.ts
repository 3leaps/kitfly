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
