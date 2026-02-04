/**
 * Template System Schema
 *
 * Defines the structure for kitfly site templates.
 * Templates are composed: minimal → handbook/runbook/etc.
 */

// -----------------------------------------------------------------------------
// Branding Configuration
// -----------------------------------------------------------------------------

export interface BrandingConfig {
	siteName: string;
	brandName?: string;
	brandUrl?: string;
	primaryColor?: string;
	footerText?: string;
}

// -----------------------------------------------------------------------------
// Section Definition
// -----------------------------------------------------------------------------

export interface SectionDef {
	name: string;
	path: string;
	description?: string;
	files?: string[]; // Optional starter files to create
}

// -----------------------------------------------------------------------------
// Template Definition
// -----------------------------------------------------------------------------

export interface TemplateDef {
	id: string;
	name: string;
	description: string;
	version: number; // Template structure version (for upgrade tracking)
	extends?: string; // Parent template to build upon
	sections: SectionDef[];
	files: TemplateFile[]; // Files to generate
	postInit?: string[]; // Commands to run after init
}

// -----------------------------------------------------------------------------
// Site Manifest (created in .kitfly/ for all sites)
// -----------------------------------------------------------------------------

export interface SiteManifest {
	template: string;
	templateVersion: number;
	created: string; // ISO timestamp
	kitflyVersion: string;
	standalone: boolean;
	// Optional: version of schemas used by site.yaml/theme.yaml
	schemaVersion?: string;
	// Optional: updated timestamp for kitfly update
	lastUpdated?: string;
	// Optional: history of kitfly updates applied to this site
	updateHistory?: {
		from: string;
		to: string;
		date: string;
	}[];
}

export interface TemplateFile {
	path: string;
	content: string | ((ctx: TemplateContext) => string);
}

// -----------------------------------------------------------------------------
// Template Context (passed to content generators)
// -----------------------------------------------------------------------------

export interface TemplateContext {
	name: string; // Site/folder name
	branding: BrandingConfig;
	template: TemplateDef;
	year: number;
}

// -----------------------------------------------------------------------------
// Init Options
// -----------------------------------------------------------------------------

export interface InitOptions {
	name: string;
	template: string;
	git?: boolean;
	prompt?: boolean;
	standalone?: boolean; // Copy site code for self-contained operation
	aiAssist?: boolean; // Add AI assistance instrumentation (AGENTS.md, roles)
	branding?: Partial<BrandingConfig>;
}

// -----------------------------------------------------------------------------
// Standalone Provenance (tracks what was copied)
// -----------------------------------------------------------------------------

export interface StandaloneProvenance {
	kitflyVersion: string;
	createdAt: string;
	updatedAt?: string;
	template: string;
	files: {
		path: string;
		sourceHash: string; // SHA256 of source content
		localHash?: string; // SHA256 of local content (post-write)
		modified?: boolean; // Local file differs from sourceHash
	}[];
}

// -----------------------------------------------------------------------------
// Template Registry
// -----------------------------------------------------------------------------

export type TemplateRegistry = Map<string, TemplateDef>;
