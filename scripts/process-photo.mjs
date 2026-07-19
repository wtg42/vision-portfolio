#!/usr/bin/env node

import path from "node:path";
import { formatBytes } from "./lib/photo-pipeline.mjs";
import { processPhoto } from "./lib/photo-processing-state.mjs";

const parseArguments = (argumentsList) => {
  const values = { replace: false };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--replace") {
      values.replace = true;
      continue;
    }
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
    "Usage: npm run photos:process -- --input photo-sources/inbox/photo.jpg --slug photo-slug [--replace]",
  );
};

try {
  const argumentsMap = parseArguments(process.argv.slice(2));
  if (!argumentsMap.input || !argumentsMap.slug) {
    printUsage();
    process.exitCode = 1;
  } else {
    const report = await processPhoto({
      inputPath: path.resolve(argumentsMap.input),
      slug: argumentsMap.slug,
      replace: argumentsMap.replace,
    });

    if (report.status === "already-processed") {
      console.log(
        `Already processed ${report.slug}; source and derivatives are unchanged.`,
      );
    } else {
      console.log(`${report.status === "replaced" ? "Replaced" : "Processed"} ${report.slug}`);
      console.log(`- source: ${report.sourcePath}`);
      for (const [name, output] of Object.entries(report.outputs)) {
        console.log(
          `- ${name}: ${output.width}x${output.height}, ${formatBytes(output.bytes)}`,
        );
      }
      console.log("Next: review the images and update src/data/photos.ts.");
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  printUsage();
  process.exitCode = 1;
}
