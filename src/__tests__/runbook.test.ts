/**
 * Tests for the Runbook template definition
 *
 * Covers: src/templates/runbook.ts
 * Strategy: import the template directly, verify structure and generated content
 */

import { describe, expect, it } from "vitest";
import { runbook } from "../templates/runbook.ts";
import type { BrandingConfig, TemplateContext, TemplateFile } from "../templates/schema.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a standard TemplateContext for testing */
function makeCtx(overrides?: Partial<TemplateContext>): TemplateContext {
	const branding: BrandingConfig = {
		siteName: "Test Runbook",
		brandName: "Acme Corp",
		brandUrl: "https://acme.example.com",
		primaryColor: "#2563eb",
		footerText: "Footer text",
	};
	return {
		name: "test-runbook",
		branding,
		template: runbook,
		year: 2026,
		...overrides,
	};
}

/** Resolve the content of a TemplateFile to a string */
function resolveContent(file: TemplateFile, ctx: TemplateContext): string {
	return typeof file.content === "function" ? file.content(ctx) : file.content;
}

/** Find a file entry by its path */
function findFile(path: string): TemplateFile {
	const f = runbook.files.find((entry) => entry.path === path);
	if (!f) throw new Error(`Template file not found: ${path}`);
	return f;
}

// ---------------------------------------------------------------------------
// Template Definition Structure
// ---------------------------------------------------------------------------

describe("runbook template definition", () => {
	it("has correct identity metadata", () => {
		expect(runbook.id).toBe("runbook");
		expect(runbook.name).toBe("Runbook");
		expect(runbook.version).toBe(1);
		expect(runbook.extends).toBe("minimal");
	});

	it("has a non-empty description", () => {
		expect(runbook.description).toBeTruthy();
		expect(runbook.description.length).toBeGreaterThan(10);
	});

	it("defines exactly four sections", () => {
		expect(runbook.sections).toHaveLength(4);
	});

	it("defines the expected section names", () => {
		const names = runbook.sections.map((s) => s.name);
		expect(names).toEqual(["Procedures", "Troubleshooting", "Reference", "Incidents"]);
	});

	it("defines the expected section paths", () => {
		const paths = runbook.sections.map((s) => s.path);
		expect(paths).toEqual([
			"content/procedures",
			"content/troubleshooting",
			"content/reference",
			"content/incidents",
		]);
	});

	it("every section has a description", () => {
		for (const section of runbook.sections) {
			expect(section.description).toBeTruthy();
			expect(typeof section.description).toBe("string");
		}
	});

	it("defines a non-empty files array", () => {
		expect(runbook.files.length).toBeGreaterThan(0);
	});

	it("every file has a non-empty path", () => {
		for (const file of runbook.files) {
			expect(file.path).toBeTruthy();
			expect(typeof file.path).toBe("string");
		}
	});

	it("every file has content (string or function)", () => {
		for (const file of runbook.files) {
			expect(["string", "function"]).toContain(typeof file.content);
		}
	});

	it("has no duplicate file paths", () => {
		const paths = runbook.files.map((f) => f.path);
		const unique = new Set(paths);
		expect(unique.size).toBe(paths.length);
	});
});

// ---------------------------------------------------------------------------
// site.yaml Generation
// ---------------------------------------------------------------------------

describe("runbook site.yaml", () => {
	const ctx = makeCtx();
	const file = findFile("site.yaml");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("includes the site title from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('title: "Test Runbook"');
	});

	it("includes the brand name from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('name: "Acme Corp"');
	});

	it("includes the brand url from context", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('url: "https://acme.example.com"');
	});

	it("includes sections block with all four sections", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("sections:");
		expect(content).toContain('"Procedures"');
		expect(content).toContain('"Troubleshooting"');
		expect(content).toContain('"Reference"');
		expect(content).toContain('"Incidents"');
	});

	it("includes section paths", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('"content/procedures"');
		expect(content).toContain('"content/troubleshooting"');
		expect(content).toContain('"content/reference"');
		expect(content).toContain('"content/incidents"');
	});

	it("sets home page to index.md", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain('home: "index.md"');
	});

	it("includes documentation link", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("https://github.com/3leaps/kitfly");
	});

	it("responds to different branding values", () => {
		const customCtx = makeCtx({
			branding: {
				siteName: "Widget Ops",
				brandName: "Widget Inc",
				brandUrl: "/",
			},
		});
		const content = resolveContent(file, customCtx);
		expect(content).toContain('title: "Widget Ops"');
		expect(content).toContain('name: "Widget Inc"');
		expect(content).toContain('url: "/"');
	});
});

// ---------------------------------------------------------------------------
// index.md Generation
// ---------------------------------------------------------------------------

describe("runbook index.md", () => {
	const ctx = makeCtx();
	const file = findFile("index.md");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("starts with YAML frontmatter", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/^---\n/);
		expect(content).toContain("title: Home");
	});

	it("includes site name in frontmatter description", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("description: Test Runbook - Operational Runbook");
	});

	it("includes site name in the H1 heading", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("# Test Runbook");
	});

	it("references brand name in the body", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("Operational runbook for Acme Corp");
	});

	it("contains quick links to key sections", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Quick Links");
		expect(content).toContain("[Procedures](/content/procedures/deployment)");
		expect(content).toContain("[Troubleshooting](/content/troubleshooting/common-issues)");
		expect(content).toContain("[Reference](/content/reference/interfaces/api-template)");
		expect(content).toContain("[Incidents](/content/incidents/escalation)");
	});

	it("contains an on-call quick reference table", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## On-Call Quick Reference");
		expect(content).toContain("| Severity | Response Time | Escalation |");
		expect(content).toContain("P1 - Critical");
		expect(content).toContain("P2 - High");
		expect(content).toContain("P3 - Medium");
		expect(content).toContain("P4 - Low");
	});

	it("links to escalation procedures", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("[Escalation](/content/incidents/escalation)");
	});

	it("includes a last-updated date in ISO format", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/\*Last updated: \d{4}-\d{2}-\d{2}\*/);
	});
});

// ---------------------------------------------------------------------------
// Procedures Section Files
// ---------------------------------------------------------------------------

describe("runbook procedures section", () => {
	const ctx = makeCtx();

	describe("deployment.md", () => {
		const file = findFile("content/procedures/deployment.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter with title and description", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Deployment Procedure");
			expect(content).toContain("description: Standard deployment process for Acme Corp");
		});

		it("includes objective section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Objective");
		});

		it("includes prerequisites as checkboxes", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Prerequisites");
			expect(content).toContain("- [ ] Code reviewed and approved");
			expect(content).toContain("- [ ] Tests passing in CI");
			expect(content).toContain("- [ ] Change ticket approved");
			expect(content).toContain("- [ ] Rollback plan documented");
		});

		it("includes numbered deployment steps", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### 1. Pre-deployment Checks");
			expect(content).toContain("### 2. Create Deployment");
			expect(content).toContain("### 3. Monitor Rollout");
			expect(content).toContain("### 4. Post-deployment Validation");
		});

		it("includes rollback section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Rollback");
			expect(content).toContain("rollback.sh");
		});

		it("includes bash code blocks", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("```bash");
		});

		it("links to related pages", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Pre-deploy Checklist](/content/reference/checklists/pre-deploy)");
			expect(content).toContain("[Incident Escalation](/content/incidents/escalation)");
		});
	});
});

// ---------------------------------------------------------------------------
// Troubleshooting Section Files
// ---------------------------------------------------------------------------

describe("runbook troubleshooting section", () => {
	const ctx = makeCtx();

	describe("common-issues.md", () => {
		const file = findFile("content/troubleshooting/common-issues.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Common Issues");
		});

		it("documents Connection Timeout issue", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Connection Timeout");
			expect(content).toContain("**Symptoms**:");
			expect(content).toContain("**Possible Causes**:");
			expect(content).toContain("**Resolution**:");
			expect(content).toContain("**Escalation**:");
		});

		it("documents High Memory Usage issue", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## High Memory Usage");
			expect(content).toContain("OOM kills");
		});

		it("documents Authentication Failures issue", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Authentication Failures");
			expect(content).toContain("401 errors");
		});

		it("includes escalation link", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[on-call](/content/incidents/escalation)");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			const content1 = resolveContent(file, ctx);
			const content2 = resolveContent(file, ctx2);
			expect(content1).toBe(content2);
		});
	});
});

// ---------------------------------------------------------------------------
// Reference Section Files
// ---------------------------------------------------------------------------

describe("runbook reference section", () => {
	const ctx = makeCtx();

	describe("interfaces/api-template.md", () => {
		const file = findFile("content/reference/interfaces/api-template.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: API Integration Template");
		});

		it("includes overview table with fields", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Overview");
			expect(content).toContain("| Field | Value |");
			expect(content).toContain("**Service**");
			expect(content).toContain("**Type**");
		});

		it("includes authentication section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Authentication");
			expect(content).toContain("API Key / OAuth 2.0 / Basic Auth");
		});

		it("includes endpoints section with code examples", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Endpoints");
			expect(content).toContain("### Primary Endpoint");
			expect(content).toContain("POST https://api.vendor.com/v1/resource");
		});

		it("includes error handling table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Error Handling");
			expect(content).toContain("| Code | Meaning | Action |");
			expect(content).toContain("400");
			expect(content).toContain("401");
			expect(content).toContain("429");
			expect(content).toContain("500");
		});

		it("includes rate limits section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Rate Limits");
		});

		it("links to contacts directory", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Contacts](/content/reference/contacts/directory)");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("contacts/directory.md", () => {
		const file = findFile("content/reference/contacts/directory.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Contact Directory");
			expect(content).toContain("description: Team and vendor contacts for Acme Corp");
		});

		it("includes internal team contacts", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Internal Team");
			expect(content).toContain("### On-Call");
			expect(content).toContain("### Team Leads");
		});

		it("includes on-call contact table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("| Role | Contact | Escalation |");
			expect(content).toContain("Primary On-Call");
			expect(content).toContain("Secondary On-Call");
			expect(content).toContain("Engineering Lead");
		});

		it("includes vendor contacts", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Vendor Contacts");
			expect(content).toContain("### Cloud Provider");
		});

		it("links to escalation procedures", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Escalation Procedures](/content/incidents/escalation)");
		});
	});

	describe("checklists/pre-deploy.md", () => {
		const file = findFile("content/reference/checklists/pre-deploy.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Pre-Deployment Checklist");
		});

		it("includes code readiness checklist", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Code Readiness");
			expect(content).toContain("- [ ] All tests passing in CI");
			expect(content).toContain("- [ ] Code review approved");
		});

		it("includes change management checklist", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Change Management");
			expect(content).toContain("- [ ] Change ticket created and approved");
		});

		it("includes environment verification checklist", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Environment Verification");
		});

		it("includes monitoring readiness checklist", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Monitoring Readiness");
		});

		it("includes go/no-go decision table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Go/No-Go");
			expect(content).toContain("| Criteria | Status |");
			expect(content).toContain("GO / ");
			expect(content).toContain("NO-GO");
		});

		it("links to deployment procedure", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Deployment Procedure](/content/procedures/deployment)");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("analytics/dashboards.md", () => {
		const file = findFile("content/reference/analytics/dashboards.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has frontmatter referencing brand name", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("title: Dashboards & Metrics");
			expect(content).toContain("description: Key metrics and dashboard links for Acme Corp");
		});

		it("includes primary dashboards table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Primary Dashboards");
			expect(content).toContain("| Dashboard | URL | Purpose |");
		});

		it("includes key performance indicators", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Key Performance Indicators");
			expect(content).toContain("### Availability");
			expect(content).toContain("### Business Metrics");
		});

		it("includes SLA definitions", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## SLA Definitions");
			expect(content).toContain("| Tier | Availability | Response Time |");
			expect(content).toContain("Critical");
			expect(content).toContain("Standard");
			expect(content).toContain("Best Effort");
		});

		it("includes alert thresholds table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Alert Thresholds");
			expect(content).toContain("| Alert | Warning | Critical | Action |");
			expect(content).toContain("CPU");
			expect(content).toContain("Memory");
			expect(content).toContain("Error Rate");
			expect(content).toContain("Latency P95");
		});
	});
});

// ---------------------------------------------------------------------------
// Incidents Section Files
// ---------------------------------------------------------------------------

describe("runbook incidents section", () => {
	const ctx = makeCtx();

	describe("escalation.md", () => {
		const file = findFile("content/incidents/escalation.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Escalation Procedures");
		});

		it("defines severity levels", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Severity Levels");
			expect(content).toContain("| Level | Definition | Response Time | Examples |");
			expect(content).toContain("**P1**");
			expect(content).toContain("**P2**");
			expect(content).toContain("**P3**");
			expect(content).toContain("**P4**");
		});

		it("includes escalation matrix with steps for P1", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Escalation Matrix");
			expect(content).toContain("### P1 - Critical");
			expect(content).toContain("Page on-call engineer");
		});

		it("includes escalation matrix with steps for P2", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### P2 - High");
		});

		it("includes escalation matrix for P3/P4", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("### P3/P4 - Medium/Low");
		});

		it("includes communication section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Communication");
			expect(content).toContain("### Internal Updates");
			expect(content).toContain("### External Communication");
		});

		it("includes post-incident process", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Post-Incident");
			expect(content).toContain("Post-mortem meeting");
		});

		it("links to post-mortem template", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("[Post-Mortem Template](/content/incidents/post-mortem-template)");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});

	describe("post-mortem-template.md", () => {
		const file = findFile("content/incidents/post-mortem-template.md");

		it("exists in the file list", () => {
			expect(file).toBeDefined();
		});

		it("has YAML frontmatter with title", () => {
			const content = resolveContent(file, ctx);
			expect(content).toMatch(/^---\n/);
			expect(content).toContain("title: Post-Mortem Template");
		});

		it("includes summary table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Summary");
			expect(content).toContain("| Field | Value |");
			expect(content).toContain("**Date**");
			expect(content).toContain("**Duration**");
			expect(content).toContain("**Severity**");
			expect(content).toContain("**Impact**");
			expect(content).toContain("**Status**");
		});

		it("includes timeline table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Timeline");
			expect(content).toContain("| Time (UTC) | Event |");
		});

		it("includes root cause and contributing factors", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Root Cause");
			expect(content).toContain("## Contributing Factors");
		});

		it("includes resolution section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Resolution");
		});

		it("includes lessons learned with subsections", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Lessons Learned");
			expect(content).toContain("### What Went Well");
			expect(content).toContain("### What Could Be Improved");
		});

		it("includes action items table", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## Action Items");
			expect(content).toContain("| Item | Owner | Due Date | Status |");
		});

		it("includes references section", () => {
			const content = resolveContent(file, ctx);
			expect(content).toContain("## References");
		});

		it("is a static template (does not use context)", () => {
			const ctx2 = makeCtx({
				branding: { siteName: "Other", brandName: "Other" },
			});
			expect(resolveContent(file, ctx)).toBe(resolveContent(file, ctx2));
		});
	});
});

// ---------------------------------------------------------------------------
// CUSTOMIZING.md
// ---------------------------------------------------------------------------

describe("runbook CUSTOMIZING.md", () => {
	const ctx = makeCtx();
	const file = findFile("CUSTOMIZING.md");

	it("exists in the file list", () => {
		expect(file).toBeDefined();
	});

	it("has frontmatter with template metadata", () => {
		const content = resolveContent(file, ctx);
		expect(content).toMatch(/^---\n/);
		expect(content).toContain("template: runbook");
		expect(content).toContain("template_version: 1");
	});

	it("includes the site name in the heading", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("# Customizing Test Runbook");
	});

	it("uses the project name in the directory tree", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("test-runbook/");
	});

	it("documents site.yaml configuration", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### site.yaml");
		expect(content).toContain('title: "Test Runbook"');
		expect(content).toContain('name: "Acme Corp"');
	});

	it("documents theme.yaml customization", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### theme.yaml");
	});

	it("includes the current year in footer example", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("2026 Acme Corp");
	});

	it("documents the site structure tree", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Site Structure");
		expect(content).toContain("content/");
		expect(content).toContain("procedures/");
		expect(content).toContain("troubleshooting/");
		expect(content).toContain("reference/");
		expect(content).toContain("incidents/");
	});

	it("documents adding content types", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### New Procedure");
		expect(content).toContain("### New Troubleshooting Guide");
		expect(content).toContain("### New Interface/API Doc");
		expect(content).toContain("### New Section");
	});

	it("documents procedure format", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Objective");
		expect(content).toContain("## Prerequisites");
		expect(content).toContain("## Steps");
		expect(content).toContain("## Verification");
		expect(content).toContain("## Rollback");
	});

	it("documents linking conventions", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### Internal Links");
		expect(content).toContain("### External Links");
		expect(content).toContain("### Images");
	});

	it("documents important limitations", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Important Limitations");
	});

	it("documents conventions for procedures and troubleshooting", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("### Procedures");
		expect(content).toContain("### Troubleshooting");
		expect(content).toContain("### Checklists");
	});

	it("includes brand assets table", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Brand Assets");
		expect(content).toContain("| Asset | Location | Recommended Size |");
	});

	it("includes getting help section", () => {
		const content = resolveContent(file, ctx);
		expect(content).toContain("## Getting Help");
		expect(content).toContain("https://github.com/3leaps/kitfly");
	});

	it("responds to different context values", () => {
		const customCtx = makeCtx({
			name: "my-project",
			branding: {
				siteName: "My Ops Hub",
				brandName: "My Brand",
				brandUrl: "/",
			},
			year: 2027,
		});
		const content = resolveContent(file, customCtx);
		expect(content).toContain("# Customizing My Ops Hub");
		expect(content).toContain("my-project/");
		expect(content).toContain('name: "My Brand"');
		expect(content).toContain("2027 My Brand");
	});
});

// ---------------------------------------------------------------------------
// File Coverage Completeness
// ---------------------------------------------------------------------------

describe("runbook file coverage", () => {
	const expectedFiles = [
		"site.yaml",
		"index.md",
		"content/procedures/deployment.md",
		"content/troubleshooting/common-issues.md",
		"content/reference/interfaces/api-template.md",
		"content/reference/contacts/directory.md",
		"content/reference/checklists/pre-deploy.md",
		"content/reference/analytics/dashboards.md",
		"content/incidents/escalation.md",
		"content/incidents/post-mortem-template.md",
		"CUSTOMIZING.md",
	];

	it("defines exactly the expected set of files", () => {
		const actualPaths = runbook.files.map((f) => f.path).sort();
		const expected = [...expectedFiles].sort();
		expect(actualPaths).toEqual(expected);
	});

	it("all content generators produce non-empty strings", () => {
		const ctx = makeCtx();
		for (const file of runbook.files) {
			const content = resolveContent(file, ctx);
			expect(content.length).toBeGreaterThan(0);
			expect(typeof content).toBe("string");
		}
	});

	it("all markdown files start with YAML frontmatter or a markdown heading", () => {
		const ctx = makeCtx();
		for (const file of runbook.files) {
			if (!file.path.endsWith(".md")) continue;
			const content = resolveContent(file, ctx);
			const startsWithFrontmatter = content.startsWith("---\n");
			const startsWithHeading = content.startsWith("#");
			expect(startsWithFrontmatter || startsWithHeading).toBe(true);
		}
	});

	it("site.yaml starts with a YAML comment", () => {
		const ctx = makeCtx();
		const file = findFile("site.yaml");
		const content = resolveContent(file, ctx);
		expect(content.startsWith("#")).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Branding Substitution Across All Context-Dependent Files
// ---------------------------------------------------------------------------

describe("runbook branding substitution", () => {
	it("context-dependent files use brandName, not a hardcoded value", () => {
		const ctx1 = makeCtx({
			branding: {
				siteName: "Alpha Ops",
				brandName: "Alpha Corp",
				brandUrl: "/",
			},
		});
		const ctx2 = makeCtx({
			branding: {
				siteName: "Beta Ops",
				brandName: "Beta Corp",
				brandUrl: "/",
			},
		});

		// Files that use ctx.branding.brandName in their content
		const brandDependentFiles = [
			"content/procedures/deployment.md",
			"content/reference/contacts/directory.md",
			"content/reference/analytics/dashboards.md",
		];

		for (const path of brandDependentFiles) {
			const file = findFile(path);
			const content1 = resolveContent(file, ctx1);
			const content2 = resolveContent(file, ctx2);

			expect(content1).toContain("Alpha Corp");
			expect(content1).not.toContain("Beta Corp");
			expect(content2).toContain("Beta Corp");
			expect(content2).not.toContain("Alpha Corp");
		}
	});

	it("context-dependent files use siteName where appropriate", () => {
		const ctx1 = makeCtx({
			branding: {
				siteName: "Gamma Hub",
				brandName: "Gamma Inc",
				brandUrl: "/",
			},
		});

		// site.yaml and index.md use siteName
		const siteYaml = resolveContent(findFile("site.yaml"), ctx1);
		expect(siteYaml).toContain("Gamma Hub");

		const indexMd = resolveContent(findFile("index.md"), ctx1);
		expect(indexMd).toContain("Gamma Hub");

		const customizing = resolveContent(findFile("CUSTOMIZING.md"), ctx1);
		expect(customizing).toContain("Gamma Hub");
	});

	it("static templates produce identical output regardless of context", () => {
		const ctx1 = makeCtx({
			branding: { siteName: "A", brandName: "A Corp" },
		});
		const ctx2 = makeCtx({
			branding: { siteName: "B", brandName: "B Corp" },
		});

		const staticFiles = [
			"content/troubleshooting/common-issues.md",
			"content/reference/interfaces/api-template.md",
			"content/reference/checklists/pre-deploy.md",
			"content/incidents/escalation.md",
			"content/incidents/post-mortem-template.md",
		];

		for (const path of staticFiles) {
			const file = findFile(path);
			expect(resolveContent(file, ctx1)).toBe(resolveContent(file, ctx2));
		}
	});
});
