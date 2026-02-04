import type { SiteManifest } from "../templates/schema.ts";

export interface MigrationContext {
	root: string;
	manifest: SiteManifest;
	fromSchemaVersion: string;
	toSchemaVersion: string;
}

export interface MigrationResult {
	applied: boolean;
	message: string;
}

export interface Migration {
	id: string;
	version: string; // Schema version that introduced this change
	description: string;
	breaking: boolean;

	applies: (ctx: MigrationContext) => Promise<boolean> | boolean;
	describe: () => string;
	apply: (ctx: MigrationContext) => Promise<MigrationResult>;
}
