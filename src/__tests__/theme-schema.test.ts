import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("theme schema layout.sidebarWidth pattern", () => {
	it("accepts supported CSS length units", async () => {
		const raw = await readFile(join(process.cwd(), "schemas/v0/theme.schema.json"), "utf-8");
		const schema = JSON.parse(raw) as Record<string, unknown>;
		const pattern =
			((schema.properties as Record<string, unknown>).layout as Record<string, unknown>)
				.properties &&
			(
				((schema.properties as Record<string, unknown>).layout as Record<string, unknown>)
					.properties as Record<string, unknown>
			).sidebarWidth
				? (
						(
							((schema.properties as Record<string, unknown>).layout as Record<string, unknown>)
								.properties as Record<string, unknown>
						).sidebarWidth as Record<string, unknown>
					).pattern
				: undefined;

		expect(typeof pattern).toBe("string");
		const re = new RegExp(pattern as string);
		expect(re.test("320px")).toBe(true);
		expect(re.test("18rem")).toBe(true);
		expect(re.test("75%")).toBe(true);
		expect(re.test("20em")).toBe(true);
	});

	it("rejects unsupported width expressions", async () => {
		const raw = await readFile(join(process.cwd(), "schemas/v0/theme.schema.json"), "utf-8");
		const schema = JSON.parse(raw) as Record<string, unknown>;
		const pattern = (
			(
				((schema.properties as Record<string, unknown>).layout as Record<string, unknown>)
					.properties as Record<string, unknown>
			).sidebarWidth as Record<string, unknown>
		).pattern as string;

		const re = new RegExp(pattern);
		expect(re.test("280")).toBe(false);
		expect(re.test("calc(100% - 20px)")).toBe(false);
		expect(re.test("12vw")).toBe(false);
	});
});
