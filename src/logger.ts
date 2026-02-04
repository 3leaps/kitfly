/**
 * CLI Logger - Structured logging for kitfly CLI operations
 *
 * Uses tsfulmen's simple logger. This is CLI-only code
 * and is NOT copied to standalone sites via `kitfly init`.
 *
 * Note: scripts/dev.ts uses dynamic import of tsfulmen/logging
 * directly (with try/catch) since it's site code that must work
 * without tsfulmen in standalone mode.
 */

import { createSimpleLogger } from "@fulmenhq/tsfulmen/logging";

/** CLI logger for kitfly operations */
export const log = createSimpleLogger("kitfly");
