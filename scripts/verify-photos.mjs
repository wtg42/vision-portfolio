#!/usr/bin/env node

import {
  formatBytes,
  verifyPortfolioPhotos,
} from "./lib/photo-pipeline.mjs";

try {
  const results = await verifyPortfolioPhotos();
  for (const result of results) {
    console.log(
      `✓ ${result.slug}/${result.variant}: ${result.width}x${result.height}, ${formatBytes(result.bytes)}`,
    );
  }
  console.log(`Verified ${results.length / 2} portfolio work(s).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
