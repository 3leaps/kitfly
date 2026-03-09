/**
 * kitfly docs — browse embedded documentation from the CLI.
 *
 * Subcommands:
 *   kitfly docs [list]       List available doc slugs with titles
 *   kitfly docs show <slug>  Output raw markdown to stdout
 */

import { EMBEDDED_DOCS } from "../generated/embedded-docs.ts";

// Build a Map from the generated tuple array for O(1) lookup
const docsMap = new Map<string, { title: string; content: string }>();
for (const [slug, title, content] of EMBEDDED_DOCS) {
	docsMap.set(slug, { title, content });
}

export function docsList(): void {
	if (docsMap.size === 0) {
		console.log("No embedded documentation available.");
		return;
	}

	const slugs = [...docsMap.keys()].sort();
	const maxSlug = Math.max(...slugs.map((s) => s.length));

	console.log(`Embedded documentation (${slugs.length} topics):\n`);

	for (const slug of slugs) {
		const entry = docsMap.get(slug);
		if (entry) console.log(`  ${slug.padEnd(maxSlug + 2)}${entry.title}`);
	}

	console.log(`\nUsage: kitfly docs show <slug>`);
}

export function docsShow(slug: string): void {
	const entry = docsMap.get(slug);

	if (!entry) {
		const suggestions = findSimilar(slug, [...docsMap.keys()], 3);
		console.error(`Not found: "${slug}"`);
		if (suggestions.length > 0) {
			console.error(`Did you mean: ${suggestions.join(", ")}?`);
		}
		console.error(`\nUse 'kitfly docs list' to see available topics.`);
		process.exit(1);
	}

	console.log(entry.content);
}

/**
 * Find similar slugs by prefix or substring match.
 * Returns up to `max` results, prioritizing prefix matches.
 */
export function findSimilar(query: string, slugs: string[], max: number): string[] {
	const q = query.toLowerCase();
	const prefixMatches: string[] = [];
	const substringMatches: string[] = [];

	for (const slug of slugs) {
		const s = slug.toLowerCase();
		if (s.startsWith(q) || q.startsWith(s)) {
			prefixMatches.push(slug);
		} else if (s.includes(q) || q.includes(s)) {
			substringMatches.push(slug);
		}
	}

	return [...prefixMatches, ...substringMatches].slice(0, max);
}
