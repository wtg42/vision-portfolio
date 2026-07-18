#!/usr/bin/env node

import path from "node:path";
import {
  ensurePhotoSourceDirectory,
  formatBytes,
  optimizePhoto,
} from "./lib/photo-pipeline.mjs";

const parseArguments = (argumentsList) => {
  const values = {};

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected argument: ${argument}`);
    }

    const [rawName, inlineValue] = argument.slice(2).split("=", 2);
    if (rawName !== "input" && rawName !== "slug") {
      throw new Error(`Unknown option: --${rawName}`);
    }

    const value = inlineValue ?? argumentsList[index + 1];
    if (!value || (!inlineValue && value.startsWith("--"))) {
      throw new Error(`Missing value for --${rawName}`);
    }

    values[rawName] = value;
    if (inlineValue === undefined) index += 1;
  }

  return values;
};

const printUsage = () => {
  console.error(
    "Usage: npm run photos:optimize -- --input photo-sources/photo.jpg --slug photo-slug",
  );
};

try {
  await ensurePhotoSourceDirectory();
  const argumentsMap = parseArguments(process.argv.slice(2));
  if (!argumentsMap.input || !argumentsMap.slug) {
    printUsage();
    process.exitCode = 1;
  } else {
    const report = await optimizePhoto({
      inputPath: path.resolve(argumentsMap.input),
      slug: argumentsMap.slug,
    });

    console.log(
      `Optimized ${report.slug}: ${formatBytes(report.inputBytes)} source`,
    );
    for (const [name, output] of Object.entries(report.outputs)) {
      console.log(
        `- ${name}: ${output.width}x${output.height}, ${formatBytes(output.bytes)}`,
      );
    }
    console.log(`Saved to ${report.destinationDirectory}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  printUsage();
  process.exitCode = 1;
}
