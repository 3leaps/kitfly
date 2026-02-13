import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateSlidesVisualsFences } from "../shared.ts";

const FIXTURES = join(import.meta.dir, "fixtures", "fences", "slides-visuals");

describe("slides-visuals fence contract", () => {
	it("accepts valid fixtures", async () => {
		const dir = join(FIXTURES, "valid");
		const files = await readdir(dir);
		for (const f of files) {
			const md = await readFile(join(dir, f), "utf-8");
			const diags = validateSlidesVisualsFences(md);
			expect(diags, `${f} should be valid`).toHaveLength(0);
		}
	});

	it("rejects invalid fixtures", async () => {
		const dir = join(FIXTURES, "invalid");
		const files = await readdir(dir);
		for (const f of files) {
			const md = await readFile(join(dir, f), "utf-8");
			const diags = validateSlidesVisualsFences(md);
			expect(diags.length, `${f} should be invalid`).toBeGreaterThan(0);
		}
	});
});
