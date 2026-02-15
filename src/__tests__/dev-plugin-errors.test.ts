import { describe, expect, it } from "vitest";
import { buildDevPluginErrorHtml } from "../../scripts/dev.ts";

describe("dev plugin error page", () => {
	it("shows actionable update hint for plugin version mismatch", () => {
		const html = buildDevPluginErrorHtml("Plugin slides-visuals version mismatch: 0.2.0 != 0.2.1");
		expect(html).toContain("Plugin setup error");
		expect(html).toContain("kitfly.plugins.yaml");
		expect(html).toContain("slides-visuals@0.2.1");
	});

	it("escapes error text and falls back to generic guidance", () => {
		const html = buildDevPluginErrorHtml('Invalid plugin ref: bad"@1.0.0 <x>');
		expect(html).toContain(
			"Check <code>kitfly.plugins.yaml</code> and <code>registry/plugins.yaml</code>",
		);
		expect(html).toContain("bad&quot;@1.0.0 &lt;x&gt;");
		expect(html).not.toContain('bad"@1.0.0 <x>');
	});
});
