import { migration as schemaVersioning } from "./0000_schema_versioning.ts";
import { migration as serverPort } from "./0001_server_port.ts";
import { migration as brandLogo } from "./0002_brand_logo.ts";
import type { Migration } from "./schema.ts";

export const migrations: Migration[] = [schemaVersioning, serverPort, brandLogo];

function parseSemver(v: string): [number, number, number] {
	const [maj, min, pat] = v.split(".").map((n) => parseInt(n, 10));
	return [maj || 0, min || 0, pat || 0];
}

function cmp(a: string, b: string): number {
	const aa = parseSemver(a);
	const bb = parseSemver(b);
	for (let i = 0; i < 3; i++) {
		if (aa[i] !== bb[i]) return aa[i] < bb[i] ? -1 : 1;
	}
	return 0;
}

export function getMigrationsForVersion(fromVersion: string, toVersion: string): Migration[] {
	return migrations.filter(
		(m) => cmp(m.version, fromVersion) === 1 && cmp(m.version, toVersion) <= 0,
	);
}
