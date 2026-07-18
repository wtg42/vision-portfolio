import { spawnSync } from "node:child_process";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = path.resolve(scriptDirectory, "../..");
export const SOURCE_DIRECTORY = path.join(PROJECT_ROOT, "photo-sources");
export const PORTFOLIO_DIRECTORY = path.join(
  PROJECT_ROOT,
  "src/assets/images/portfolio",
);
export const CATALOG_PATH = path.join(PROJECT_ROOT, "src/data/photos.ts");

export const PHOTO_VARIANTS = {
  thumbnail: {
    filename: "thumbnail.webp",
    width: 960,
    quality: 80,
    maxBytes: 500 * 1024,
  },
  full: {
    filename: "full.webp",
    width: 2200,
    quality: 88,
    maxBytes: 2 * 1024 * 1024,
  },
};

const supportedInputFormats = new Set([
  "avif",
  "heif",
  "jpeg",
  "png",
  "tiff",
  "webp",
]);
const prohibitedSourcePattern =
  /\.(?:arw|avif|cr2|cr3|dng|heic|heif|jpe?g|nef|orf|png|raf|rw2|tiff?)$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const forbiddenMetadataFields = ["exif", "iptc", "xmp"];

const pathExists = async (target) => {
  try {
    await stat(target);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
};

const inspectWebp = async (filePath, variant) => {
  const [metadata, fileStat] = await Promise.all([
    sharp(filePath).metadata(),
    stat(filePath),
  ]);

  if (metadata.format !== "webp") {
    throw new Error(`${variant.filename} is ${metadata.format ?? "unknown"}, not WebP`);
  }
  if (!metadata.width || !metadata.height) {
    throw new Error(`${variant.filename} has invalid intrinsic dimensions`);
  }
  if (metadata.width > variant.width) {
    throw new Error(
      `${variant.filename} width ${metadata.width}px exceeds ${variant.width}px`,
    );
  }
  if (fileStat.size > variant.maxBytes) {
    throw new Error(
      `${variant.filename} is ${fileStat.size} bytes, over ${variant.maxBytes}`,
    );
  }

  for (const field of forbiddenMetadataFields) {
    if (metadata[field]) {
      throw new Error(`${variant.filename} contains forbidden ${field} metadata`);
    }
  }

  return {
    path: filePath,
    width: metadata.width,
    height: metadata.height,
    bytes: fileStat.size,
    format: metadata.format,
    space: metadata.space,
  };
};

export const assertPhotoSlug = (slug) => {
  if (!slug || !slugPattern.test(slug)) {
    throw new Error(
      "Photo slug must use lowercase kebab-case letters and numbers",
    );
  }
};

export const ensurePhotoSourceDirectory = () =>
  mkdir(SOURCE_DIRECTORY, { recursive: true });

/**
 * @param {object} options
 * @param {string} options.inputPath
 * @param {string} options.slug
 * @param {string} [options.destinationRoot]
 * @param {(report: Record<string, unknown>) => void | Promise<void>} [options.beforeCommit]
 */
export const optimizePhoto = async ({
  inputPath,
  slug,
  destinationRoot = PORTFOLIO_DIRECTORY,
  beforeCommit = undefined,
}) => {
  assertPhotoSlug(slug);

  const resolvedInput = path.resolve(inputPath);
  const inputStat = await stat(resolvedInput);
  if (!inputStat.isFile()) {
    throw new Error(`Photo source is not a file: ${resolvedInput}`);
  }

  const sourceMetadata = await sharp(resolvedInput, {
    failOn: "error",
  }).metadata();
  if (!sourceMetadata.format || !supportedInputFormats.has(sourceMetadata.format)) {
    throw new Error(
      `Unsupported photo format: ${sourceMetadata.format ?? "unknown"}`,
    );
  }

  await mkdir(destinationRoot, { recursive: true });
  const destinationDirectory = path.join(destinationRoot, slug);
  const temporaryDirectory = path.join(
    destinationRoot,
    `.${slug}.tmp-${randomUUID()}`,
  );
  const backupDirectory = path.join(
    destinationRoot,
    `.${slug}.backup-${randomUUID()}`,
  );

  await mkdir(temporaryDirectory);

  try {
    await Promise.all(
      Object.values(PHOTO_VARIANTS).map((variant) =>
        sharp(resolvedInput, { failOn: "error" })
          .rotate()
          .toColourspace("srgb")
          .resize({
            width: variant.width,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({
            quality: variant.quality,
            effort: 6,
          })
          .toFile(path.join(temporaryDirectory, variant.filename)),
      ),
    );

    const entries = await Promise.all(
      Object.entries(PHOTO_VARIANTS).map(async ([name, variant]) => [
        name,
        await inspectWebp(
          path.join(temporaryDirectory, variant.filename),
          variant,
        ),
      ]),
    );
    const outputs = Object.fromEntries(entries);
    const report = {
      slug,
      inputPath: resolvedInput,
      inputBytes: inputStat.size,
      inputWidth: sourceMetadata.width,
      inputHeight: sourceMetadata.height,
      outputs,
    };

    if (beforeCommit) {
      await beforeCommit(report);
    }

    const hadDestination = await pathExists(destinationDirectory);
    if (hadDestination) {
      await rename(destinationDirectory, backupDirectory);
    }

    try {
      await rename(temporaryDirectory, destinationDirectory);
    } catch (error) {
      if (hadDestination && !(await pathExists(destinationDirectory))) {
        await rename(backupDirectory, destinationDirectory);
      }
      throw error;
    }

    if (hadDestination) {
      await rm(backupDirectory, { recursive: true, force: true });
    }

    return {
      ...report,
      destinationDirectory,
      outputs: Object.fromEntries(
        Object.entries(outputs).map(([name, output]) => [
          name,
          {
            ...output,
            path: path.join(
              destinationDirectory,
              PHOTO_VARIANTS[name].filename,
            ),
          },
        ]),
      ),
    };
  } catch (error) {
    await rm(temporaryDirectory, { recursive: true, force: true });
    if (
      (await pathExists(backupDirectory)) &&
      !(await pathExists(destinationDirectory))
    ) {
      await rename(backupDirectory, destinationDirectory);
    }
    throw error;
  }
};

const runGit = (projectRoot, args) =>
  spawnSync("git", args, {
    cwd: projectRoot,
    encoding: "utf8",
  });

/**
 * @param {object} [options]
 * @param {string} [options.projectRoot]
 * @param {string} [options.portfolioDirectory]
 * @param {string} [options.catalogPath]
 * @param {(args: string[]) => {status: number | null, stdout: string, stderr: string}} [options.gitRunner]
 */
export const verifyPortfolioPhotos = async ({
  projectRoot = PROJECT_ROOT,
  portfolioDirectory = path.join(
    projectRoot,
    "src/assets/images/portfolio",
  ),
  catalogPath = path.join(projectRoot, "src/data/photos.ts"),
  gitRunner = (args) => runGit(projectRoot, args),
} = {}) => {
  const failures = [];
  const results = [];

  const ignoreResult = gitRunner([
    "check-ignore",
    "-q",
    "photo-sources/example-source.jpg",
  ]);
  if (ignoreResult.status !== 0) {
    failures.push("/photo-sources/ is not fully ignored by Git");
  }

  const trackedResult = gitRunner([
    "ls-files",
    "-z",
    "--",
    "src/assets/images/portfolio",
  ]);
  if (trackedResult.status !== 0) {
    failures.push(`Unable to inspect tracked portfolio assets: ${trackedResult.stderr}`);
  } else {
    const trackedFiles = trackedResult.stdout.split("\0").filter(Boolean);
    for (const trackedFile of trackedFiles) {
      if (prohibitedSourcePattern.test(trackedFile)) {
        failures.push(`Tracked source format is prohibited: ${trackedFile}`);
      }
    }
  }

  let catalog = "";
  try {
    catalog = await readFile(catalogPath, "utf8");
  } catch (error) {
    failures.push(`Unable to read catalog: ${error.message}`);
  }

  let directoryEntries = [];
  try {
    directoryEntries = await readdir(portfolioDirectory, {
      withFileTypes: true,
    });
  } catch (error) {
    failures.push(`Unable to read portfolio asset directory: ${error.message}`);
  }

  const workDirectories = directoryEntries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (workDirectories.length === 0) {
    failures.push("No portfolio derivative directories were found");
  }

  for (const entry of workDirectories) {
    const slug = entry.name;
    try {
      assertPhotoSlug(slug);
    } catch (error) {
      failures.push(`${slug}: ${error.message}`);
      continue;
    }

    const workDirectory = path.join(portfolioDirectory, slug);
    const workFiles = await readdir(workDirectory, { withFileTypes: true });
    for (const workFile of workFiles) {
      if (
        workFile.isFile() &&
        workFile.name !== PHOTO_VARIANTS.thumbnail.filename &&
        workFile.name !== PHOTO_VARIANTS.full.filename
      ) {
        failures.push(`${slug}: unexpected asset ${workFile.name}`);
      }
    }

    for (const [name, variant] of Object.entries(PHOTO_VARIANTS)) {
      const variantPath = path.join(workDirectory, variant.filename);
      const catalogReference =
        `../assets/images/portfolio/${slug}/${variant.filename}`;

      if (!catalog.includes(catalogReference)) {
        failures.push(`${slug}: catalog does not import ${variant.filename}`);
      }

      try {
        const inspected = await inspectWebp(variantPath, variant);
        results.push({
          slug,
          variant: name,
          ...inspected,
        });
      } catch (error) {
        failures.push(`${slug}: ${error.message}`);
      }
    }
  }

  const catalogReferences = [
    ...catalog.matchAll(
      /\.\.\/assets\/images\/portfolio\/([^/]+)\/(thumbnail|full)\.webp/g,
    ),
  ];
  for (const reference of catalogReferences) {
    const referencedPath = path.join(
      portfolioDirectory,
      reference[1],
      `${reference[2]}.webp`,
    );
    if (!(await pathExists(referencedPath))) {
      failures.push(`Catalog references missing asset: ${referencedPath}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Photo asset verification failed:\n- ${failures.join("\n- ")}`);
  }

  return results;
};

export const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
};
