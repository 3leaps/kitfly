import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validatePlanningVisualsFences } from "../shared.ts";

const FIXTURES = join(__dirname, "fixtures", "fences", "planning-visuals");

describe("planning-visuals fence contract", () => {
	it("accepts valid fixtures", async () => {
		const dir = join(FIXTURES, "valid");
		const files = await readdir(dir);
		for (const f of files) {
			const md = await readFile(join(dir, f), "utf-8");
			const diags = validatePlanningVisualsFences(md);
			expect(diags, `${f} should be valid`).toHaveLength(0);
		}
	});

	it("rejects invalid fixtures", async () => {
		const dir = join(FIXTURES, "invalid");
		const files = await readdir(dir);
		for (const f of files) {
			const md = await readFile(join(dir, f), "utf-8");
			const diags = validatePlanningVisualsFences(md);
			expect(diags.length, `${f} should be invalid`).toBeGreaterThan(0);
		}
	});
});
