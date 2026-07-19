#!/usr/bin/env node

import path from "node:path";
import { getPhotoProcessingStatus } from "./lib/photo-processing-state.mjs";

if (process.argv.length > 2) {
  console.error("Usage: npm run photos:status");
  process.exitCode = 1;
} else {
  try {
    const report = await getPhotoProcessingStatus();
    if (report.entries.length === 0) {
      console.log("No local photo processing state found.");
    } else {
      for (const entry of report.entries) {
        const identity = entry.slug ?? path.basename(entry.sourcePath);
        const publication = entry.published ? "published" : "not published";
        const issues =
          entry.issues.length > 0 ? ` — ${entry.issues.join("; ")}` : "";
        console.log(
          `${entry.state.padEnd(9)} ${identity} (${publication})${issues}`,
        );
      }
    }
    if (report.hasBroken) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
