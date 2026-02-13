import { createHash } from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadPluginInjections, PluginConfigError, PluginIntegrityError } from "../plugin-loader.ts";

function sha256Hex(text: string): string {
	return createHash("sha256").update(new TextEncoder().encode(text)).digest("hex");
}

describe("plugin loader", () => {
	it("inlines local assets with checksum verification", async () => {
		const root = await mkdtemp(join(tmpdir(), "kitfly-plugins-"));

		await mkdir(join(root, "registry"), { recursive: true });
		await mkdir(join(root, "plugins-dist"), { recursive: true });

		const js = "console.log('hello plugin');";
		const css = ".hello{color:red;}";
		await writeFile(join(root, "plugins-dist", "hello.js"), js, "utf-8");
		await writeFile(join(root, "plugins-dist", "hello.css"), css, "utf-8");

		const registryYaml = `version: 1
updated: "2026-02-12"
baseUrl: ""
plugins:
  hello:
    name: "Hello"
    description: "Test plugin"
    version: "1.0.0"
    contract: "1"
    kitfly: ">=0.2.0 <1.0.0"
    license: MIT
    verified: true
    assets:
      js: "plugins-dist/hello.js"
      css: "plugins-dist/hello.css"
      assetSha256:
        js: "sha256:${sha256Hex(js)}"
        css: "sha256:${sha256Hex(css)}"
`;

		await writeFile(join(root, "registry", "plugins.yaml"), registryYaml, "utf-8");

		const configYaml = `plugins:
  - hello@1.0.0
`;
		await writeFile(join(root, "kitfly.plugins.yaml"), configYaml, "utf-8");

		const injections = await loadPluginInjections({ root });
		expect(injections.head).toContain(css);
		expect(injections.bodyEnd).toContain(js);
	});

	it("respects plugin mode allowlist (modes)", async () => {
		const root = await mkdtemp(join(tmpdir(), "kitfly-plugins-"));

		await mkdir(join(root, "registry"), { recursive: true });
		await mkdir(join(root, "plugins-dist"), { recursive: true });

		const js = "console.log('hello plugin');";
		await writeFile(join(root, "plugins-dist", "hello.js"), js, "utf-8");

		const registryYaml = `version: 1
updated: "2026-02-12"
baseUrl: ""
plugins:
  hello:
    name: "Hello"
    description: "Test plugin"
    version: "1.0.0"
    contract: "1"
    kitfly: ">=0.2.0 <1.0.0"
    license: MIT
    verified: true
    modes: ["slides"]
    assets:
      js: "plugins-dist/hello.js"
      assetSha256:
        js: "sha256:${sha256Hex(js)}"
`;

		await writeFile(join(root, "registry", "plugins.yaml"), registryYaml, "utf-8");
		await writeFile(join(root, "kitfly.plugins.yaml"), "plugins:\n  - hello@1.0.0\n", "utf-8");

		const docs = await loadPluginInjections({ root, mode: "docs" });
		expect(docs.head).toBe("");
		expect(docs.bodyEnd).toBe("");

		const slides = await loadPluginInjections({ root, mode: "slides" });
		expect(slides.bodyEnd).toContain(js);
	});

	it("treats empty modes as blocked", async () => {
		const root = await mkdtemp(join(tmpdir(), "kitfly-plugins-"));

		await mkdir(join(root, "registry"), { recursive: true });
		await mkdir(join(root, "plugins-dist"), { recursive: true });

		const js = "console.log('hello plugin');";
		await writeFile(join(root, "plugins-dist", "hello.js"), js, "utf-8");

		const registryYaml = `version: 1
updated: "2026-02-12"
baseUrl: ""
plugins:
  hello:
    name: "Hello"
    description: "Test plugin"
    version: "1.0.0"
    contract: "1"
    kitfly: ">=0.2.0 <1.0.0"
    license: MIT
    verified: true
    modes: []
    assets:
      js: "plugins-dist/hello.js"
      assetSha256:
        js: "sha256:${sha256Hex(js)}"
`;

		await writeFile(join(root, "registry", "plugins.yaml"), registryYaml, "utf-8");
		await writeFile(join(root, "kitfly.plugins.yaml"), "plugins:\n  - hello@1.0.0\n", "utf-8");

		const injections = await loadPluginInjections({ root, mode: "slides" });
		expect(injections.head).toBe("");
		expect(injections.bodyEnd).toBe("");
	});

	it("throws on checksum mismatch", async () => {
		const root = await mkdtemp(join(tmpdir(), "kitfly-plugins-"));

		await mkdir(join(root, "registry"), { recursive: true });
		await mkdir(join(root, "plugins-dist"), { recursive: true });

		const js = "console.log('hello plugin');";
		await writeFile(join(root, "plugins-dist", "hello.js"), js, "utf-8");

		const registryYaml = `version: 1
updated: "2026-02-12"
baseUrl: ""
plugins:
  hello:
    name: "Hello"
    description: "Test plugin"
    version: "1.0.0"
    contract: "1"
    kitfly: ">=0.2.0 <1.0.0"
    license: MIT
    verified: true
    assets:
      js: "plugins-dist/hello.js"
      assetSha256:
        js: "sha256:${"0".repeat(64)}"
`;

		await writeFile(join(root, "registry", "plugins.yaml"), registryYaml, "utf-8");
		await writeFile(join(root, "kitfly.plugins.yaml"), "plugins:\n  - hello@1.0.0\n", "utf-8");

		await expect(loadPluginInjections({ root })).rejects.toBeInstanceOf(PluginIntegrityError);
	});

	it("rejects invalid canonical refs (prevents attribute injection)", async () => {
		const root = await mkdtemp(join(tmpdir(), "kitfly-plugins-"));
		await mkdir(join(root, "registry"), { recursive: true });

		await writeFile(
			join(root, "registry", "plugins.yaml"),
			`version: 1
updated: "2026-02-12"
baseUrl: ""
plugins: {}
`,
			"utf-8",
		);

		await writeFile(
			join(root, "kitfly.plugins.yaml"),
			`plugins:
  - bad"@1.0.0
`,
			"utf-8",
		);

		await expect(loadPluginInjections({ root })).rejects.toBeInstanceOf(PluginConfigError);
	});
});
