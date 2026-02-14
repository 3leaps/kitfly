import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		exclude: ["**/*.bun.test.*", "node_modules/**"],
	},
});
