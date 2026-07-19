import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  assertPhotoSlug,
  CATALOG_PATH,
  discardPreparedPhotoDerivatives,
  inspectWebp,
  pathExists,
  PHOTO_VARIANTS,
  PORTFOLIO_DIRECTORY,
  preparePhotoDerivatives,
  PROJECT_ROOT,
  SOURCE_DIRECTORY,
} from "./photo-pipeline.mjs";

export const SOURCE_INBOX_DIRECTORY = path.join(SOURCE_DIRECTORY, "inbox");
export const SOURCE_PROCESSED_DIRECTORY = path.join(
  SOURCE_DIRECTORY,
  "processed",
);
export const SOURCE_MANIFEST_PATH = path.join(
  SOURCE_DIRECTORY,
  ".manifest.json",
);
export const PHOTO_MANIFEST_VERSION = 1;
export const PHOTO_PIPELINE_VERSION = "1";

const sha256Pattern = /^[a-f0-9]{64}$/;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const normalizeRelativePath = (value) => value.split(path.sep).join("/");

const assertSafeRelativePath = (value, label) => {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    path.isAbsolute(value) ||
    value.split(/[\\/]/).includes("..")
  ) {
    throw new Error(`${label} must be a safe relative path`);
  }
};

const assertSha256 = (value, label) => {
  if (typeof value !== "string" || !sha256Pattern.test(value)) {
    throw new Error(`${label} must be a lowercase SHA-256 digest`);
  }
};

const assertPositiveInteger = (value, label) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
};

const validateDerivativeRecord = (record, label) => {
  if (!isPlainObject(record)) {
    throw new Error(`${label} must be an object`);
  }
  assertSha256(record.sha256, `${label}.sha256`);
  assertPositiveInteger(record.width, `${label}.width`);
  assertPositiveInteger(record.height, `${label}.height`);
  assertPositiveInteger(record.bytes, `${label}.bytes`);
};

const validateManifestEntry = (slug, entry) => {
  assertPhotoSlug(slug);
  if (!isPlainObject(entry) || entry.slug !== slug) {
    throw new Error(`Manifest entry ${slug} must contain the matching slug`);
  }
  if (!isPlainObject(entry.source)) {
    throw new Error(`Manifest entry ${slug}.source must be an object`);
  }
  assertSha256(entry.source.sha256, `${slug}.source.sha256`);
  assertSafeRelativePath(entry.source.relativePath, `${slug}.source.relativePath`);
  const normalizedSourcePath = normalizeRelativePath(
    entry.source.relativePath,
  );
  if (!normalizedSourcePath.startsWith(`processed/${slug}/`)) {
    throw new Error(
      `${slug}.source.relativePath must be inside processed/${slug}/`,
    );
  }
  if (
    typeof entry.source.originalFilename !== "string" ||
    entry.source.originalFilename.length === 0 ||
    path.basename(entry.source.originalFilename) !==
      entry.source.originalFilename
  ) {
    throw new Error(
      `${slug}.source.originalFilename must be a filename without directories`,
    );
  }
  assertPositiveInteger(entry.source.bytes, `${slug}.source.bytes`);
  if (
    typeof entry.processedAt !== "string" ||
    Number.isNaN(Date.parse(entry.processedAt))
  ) {
    throw new Error(`${slug}.processedAt must be an ISO date string`);
  }
  if (
    !isPlainObject(entry.pipeline) ||
    typeof entry.pipeline.version !== "string" ||
    entry.pipeline.version.length === 0
  ) {
    throw new Error(`${slug}.pipeline.version must be a non-empty string`);
  }
  assertSha256(entry.pipeline.fingerprint, `${slug}.pipeline.fingerprint`);
  if (!isPlainObject(entry.derivatives)) {
    throw new Error(`${slug}.derivatives must be an object`);
  }
  for (const name of Object.keys(PHOTO_VARIANTS)) {
    validateDerivativeRecord(
      entry.derivatives[name],
      `${slug}.derivatives.${name}`,
    );
  }
};

export const createEmptyPhotoManifest = () => ({
  version: PHOTO_MANIFEST_VERSION,
  entries: {},
});

export const validatePhotoManifest = (manifest) => {
  if (!isPlainObject(manifest)) {
    throw new Error("Photo manifest must be an object");
  }
  if (manifest.version !== PHOTO_MANIFEST_VERSION) {
    throw new Error(
      `Unsupported photo manifest version: ${String(manifest.version)}`,
    );
  }
  if (!isPlainObject(manifest.entries)) {
    throw new Error("Photo manifest entries must be an object");
  }
  for (const [slug, entry] of Object.entries(manifest.entries)) {
    validateManifestEntry(slug, entry);
  }
  return manifest;
};

export const hashFileSha256 = (filePath) =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });

export const getPhotoPipelineFingerprint = () =>
  createHash("sha256")
    .update(
      JSON.stringify({
        version: PHOTO_PIPELINE_VERSION,
        format: "webp",
        effort: 6,
        orientation: "auto",
        colourspace: "srgb",
        metadata: "omit",
        variants: PHOTO_VARIANTS,
      }),
    )
    .digest("hex");

export const getManagedPhotoPaths = (sourceDirectory = SOURCE_DIRECTORY) => ({
  sourceDirectory,
  inboxDirectory: path.join(sourceDirectory, "inbox"),
  processedDirectory: path.join(sourceDirectory, "processed"),
  manifestPath: path.join(sourceDirectory, ".manifest.json"),
});

export const ensureManagedPhotoDirectories = async ({
  sourceDirectory = SOURCE_DIRECTORY,
} = {}) => {
  const paths = getManagedPhotoPaths(sourceDirectory);
  await Promise.all([
    mkdir(paths.inboxDirectory, { recursive: true }),
    mkdir(paths.processedDirectory, { recursive: true }),
  ]);
  return paths;
};

export const readPhotoManifest = async ({
  manifestPath = SOURCE_MANIFEST_PATH,
  allowMissing = true,
} = {}) => {
  try {
    const contents = await readFile(manifestPath, "utf8");
    return validatePhotoManifest(JSON.parse(contents));
  } catch (error) {
    if (allowMissing && error?.code === "ENOENT") {
      return createEmptyPhotoManifest();
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Photo manifest is not valid JSON: ${error.message}`);
    }
    throw error;
  }
};

export const writePhotoManifestAtomic = async (
  manifest,
  { manifestPath = SOURCE_MANIFEST_PATH } = {},
) => {
  validatePhotoManifest(manifest);
  await mkdir(path.dirname(manifestPath), { recursive: true });
  const temporaryPath = `${manifestPath}.tmp-${randomUUID()}`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(temporaryPath, manifestPath);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
};

const getCatalogText = async (catalogPath) => {
  try {
    return await readFile(catalogPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return "";
    throw error;
  }
};

const isPublishedInCatalog = (catalog, slug) =>
  catalog.includes(`../assets/images/portfolio/${slug}/`);

const inspectRecordedEntry = async ({
  slug,
  entry,
  sourceDirectory,
  portfolioDirectory,
  pipelineFingerprint,
}) => {
  const issues = [];
  let state = "processed";
  const sourcePath = path.resolve(sourceDirectory, entry.source.relativePath);
  const sourceRelative = path.relative(sourceDirectory, sourcePath);
  if (
    sourceRelative.startsWith("..") ||
    path.isAbsolute(sourceRelative)
  ) {
    return {
      state: "broken",
      issues: ["recorded source path escapes photo-sources"],
    };
  }

  try {
    const sourceHash = await hashFileSha256(sourcePath);
    if (sourceHash !== entry.source.sha256) {
      state = "changed";
      issues.push("source SHA-256 differs");
    }
  } catch (error) {
    state = "broken";
    issues.push(
      error?.code === "ENOENT"
        ? "recorded source is missing"
        : `source cannot be read: ${error.message}`,
    );
  }

  if (entry.pipeline.fingerprint !== pipelineFingerprint) {
    if (state !== "broken") state = "changed";
    issues.push("pipeline fingerprint differs");
  }

  for (const [name, variant] of Object.entries(PHOTO_VARIANTS)) {
    const derivativePath = path.join(
      portfolioDirectory,
      slug,
      variant.filename,
    );
    try {
      await inspectWebp(derivativePath, variant);
      const derivativeHash = await hashFileSha256(derivativePath);
      if (derivativeHash !== entry.derivatives[name].sha256) {
        state = "broken";
        issues.push(`${name} SHA-256 differs`);
      }
    } catch (error) {
      state = "broken";
      issues.push(`${name} is invalid: ${error.message}`);
    }
  }

  return { state, issues };
};

const listInboxFiles = async (inboxDirectory) => {
  try {
    const entries = await readdir(inboxDirectory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map((entry) => path.join(inboxDirectory, entry.name))
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
};

export const getPhotoProcessingStatus = async ({
  sourceDirectory = SOURCE_DIRECTORY,
  portfolioDirectory = PORTFOLIO_DIRECTORY,
  catalogPath = CATALOG_PATH,
  manifestPath = path.join(sourceDirectory, ".manifest.json"),
} = {}) => {
  const paths = getManagedPhotoPaths(sourceDirectory);
  const [manifest, catalog, inboxFiles] = await Promise.all([
    readPhotoManifest({ manifestPath }),
    getCatalogText(catalogPath),
    listInboxFiles(paths.inboxDirectory),
  ]);
  const pipelineFingerprint = getPhotoPipelineFingerprint();
  const entries = [];

  for (const [slug, entry] of Object.entries(manifest.entries).sort(
    ([left], [right]) => left.localeCompare(right),
  )) {
    const inspected = await inspectRecordedEntry({
      slug,
      entry,
      sourceDirectory,
      portfolioDirectory,
      pipelineFingerprint,
    });
    entries.push({
      kind: "work",
      slug,
      state: inspected.state,
      published: isPublishedInCatalog(catalog, slug),
      issues: inspected.issues,
      sourcePath: path.join(sourceDirectory, entry.source.relativePath),
    });
  }

  const manifestHashes = new Set(
    Object.values(manifest.entries).map((entry) => entry.source.sha256),
  );
  for (const inboxPath of inboxFiles) {
    const sourceHash = await hashFileSha256(inboxPath);
    const existingEntry = Object.values(manifest.entries).find(
      (entry) => entry.source.sha256 === sourceHash,
    );
    entries.push({
      kind: "inbox",
      slug: existingEntry?.slug ?? null,
      state: manifestHashes.has(sourceHash) ? "processed" : "new",
      published: existingEntry
        ? isPublishedInCatalog(catalog, existingEntry.slug)
        : false,
      issues: existingEntry ? ["duplicate content remains in inbox"] : [],
      sourcePath: inboxPath,
    });
  }

  return {
    manifest,
    entries,
    hasBroken: entries.some((entry) => entry.state === "broken"),
  };
};

const ensurePathInside = (parent, target, label) => {
  const relative = path.relative(parent, target);
  if (
    relative.length === 0 ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`${label} must be a file inside ${parent}`);
  }
};

const buildDerivativeRecords = async (prepared) =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(PHOTO_VARIANTS).map(async ([name, variant]) => {
        const output = prepared.report.outputs[name];
        const outputPath = path.join(
          prepared.temporaryDirectory,
          variant.filename,
        );
        return [
          name,
          {
            sha256: await hashFileSha256(outputPath),
            width: output.width,
            height: output.height,
            bytes: output.bytes,
          },
        ];
      }),
    ),
  );

const verifyEntryDerivatives = async ({
  slug,
  entry,
  portfolioDirectory,
}) => {
  for (const [name, variant] of Object.entries(PHOTO_VARIANTS)) {
    const derivativePath = path.join(
      portfolioDirectory,
      slug,
      variant.filename,
    );
    try {
      await inspectWebp(derivativePath, variant);
      if (
        (await hashFileSha256(derivativePath)) !==
        entry.derivatives[name].sha256
      ) {
        return false;
      }
    } catch {
      return false;
    }
  }
  return true;
};

/**
 * @param {object} options
 * @param {string} options.inputPath
 * @param {string} options.slug
 * @param {boolean} [options.replace]
 * @param {string} [options.sourceDirectory]
 * @param {string} [options.portfolioDirectory]
 * @param {string} [options.manifestPath]
 * @param {() => Date} [options.now]
 * @param {(step: string) => void | Promise<void>} [options.beforeTransactionStep]
 */
export const processPhoto = async ({
  inputPath,
  slug,
  replace = false,
  sourceDirectory = SOURCE_DIRECTORY,
  portfolioDirectory = PORTFOLIO_DIRECTORY,
  manifestPath = path.join(sourceDirectory, ".manifest.json"),
  now = () => new Date(),
  beforeTransactionStep = undefined,
}) => {
  assertPhotoSlug(slug);
  const paths = await ensureManagedPhotoDirectories({ sourceDirectory });
  const resolvedInput = path.resolve(inputPath);
  ensurePathInside(paths.inboxDirectory, resolvedInput, "Photo input");
  const inputStat = await stat(resolvedInput);
  if (!inputStat.isFile()) {
    throw new Error(`Photo input is not a file: ${resolvedInput}`);
  }

  const [manifest, sourceSha256] = await Promise.all([
    readPhotoManifest({ manifestPath }),
    hashFileSha256(resolvedInput),
  ]);
  const pipelineFingerprint = getPhotoPipelineFingerprint();
  const existingEntry = manifest.entries[slug];

  if (
    existingEntry &&
    existingEntry.source.sha256 === sourceSha256 &&
    existingEntry.pipeline.fingerprint === pipelineFingerprint &&
    (await verifyEntryDerivatives({
      slug,
      entry: existingEntry,
      portfolioDirectory,
    }))
  ) {
    return {
      slug,
      status: "already-processed",
      sourceSha256,
      destinationDirectory: path.join(portfolioDirectory, slug),
    };
  }

  if (existingEntry && existingEntry.source.sha256 !== sourceSha256 && !replace) {
    throw new Error(
      `Photo slug "${slug}" already has different source content; rerun with --replace`,
    );
  }

  const prepared = await preparePhotoDerivatives({
    inputPath: resolvedInput,
    slug,
    destinationRoot: portfolioDirectory,
  });
  const derivativeRecords = await buildDerivativeRecords(prepared);
  const extension = path.extname(path.basename(resolvedInput)).toLowerCase();
  const processedSlugDirectory = path.join(paths.processedDirectory, slug);
  const processedSourcePath = path.join(
    processedSlugDirectory,
    `${sourceSha256.slice(0, 12)}${extension || ".source"}`,
  );
  const processedRelativePath = normalizeRelativePath(
    path.relative(sourceDirectory, processedSourcePath),
  );
  const nextManifest = structuredClone(manifest);
  nextManifest.entries[slug] = {
    slug,
    source: {
      sha256: sourceSha256,
      relativePath: processedRelativePath,
      originalFilename: path.basename(resolvedInput),
      bytes: inputStat.size,
    },
    processedAt: now().toISOString(),
    pipeline: {
      version: PHOTO_PIPELINE_VERSION,
      fingerprint: pipelineFingerprint,
    },
    derivatives: derivativeRecords,
  };
  validatePhotoManifest(nextManifest);

  await mkdir(processedSlugDirectory, { recursive: true });
  await mkdir(path.dirname(manifestPath), { recursive: true });

  const destinationDirectory = prepared.destinationDirectory;
  const transactionId = randomUUID();
  const derivativeBackup = `${destinationDirectory}.backup-${transactionId}`;
  const manifestStaged = `${manifestPath}.tmp-${transactionId}`;
  const manifestBackup = `${manifestPath}.backup-${transactionId}`;
  const hadDestination = await pathExists(destinationDirectory);
  const hadManifest = await pathExists(manifestPath);
  const processedSourceAlreadyExists = await pathExists(processedSourcePath);
  let sourceMoved = false;
  let derivativeBackedUp = false;
  let derivativeCommitted = false;
  let manifestBackedUp = false;
  let manifestCommitted = false;

  await writeFile(
    manifestStaged,
    `${JSON.stringify(nextManifest, null, 2)}\n`,
    { encoding: "utf8", mode: 0o600 },
  );

  try {
    if (beforeTransactionStep) await beforeTransactionStep("source");
    if (!processedSourceAlreadyExists) {
      await rename(resolvedInput, processedSourcePath);
      sourceMoved = true;
    }

    if (beforeTransactionStep) await beforeTransactionStep("derivatives");
    if (hadDestination) {
      await rename(destinationDirectory, derivativeBackup);
      derivativeBackedUp = true;
    }
    await rename(prepared.temporaryDirectory, destinationDirectory);
    derivativeCommitted = true;

    if (beforeTransactionStep) await beforeTransactionStep("manifest");
    if (hadManifest) {
      await rename(manifestPath, manifestBackup);
      manifestBackedUp = true;
    }
    await rename(manifestStaged, manifestPath);
    manifestCommitted = true;

    await Promise.all([
      rm(derivativeBackup, { recursive: true, force: true }),
      rm(manifestBackup, { force: true }),
    ]);

    return {
      slug,
      status: existingEntry ? "replaced" : "processed",
      sourceSha256,
      sourcePath: processedSourcePath,
      destinationDirectory,
      outputs: Object.fromEntries(
        Object.entries(PHOTO_VARIANTS).map(([name, variant]) => [
          name,
          {
            ...derivativeRecords[name],
            path: path.join(destinationDirectory, variant.filename),
          },
        ]),
      ),
    };
  } catch (error) {
    if (manifestCommitted) {
      await rm(manifestPath, { force: true });
    }
    if (manifestBackedUp && (await pathExists(manifestBackup))) {
      await rename(manifestBackup, manifestPath);
    }
    if (derivativeCommitted) {
      await rm(destinationDirectory, { recursive: true, force: true });
    }
    if (derivativeBackedUp && (await pathExists(derivativeBackup))) {
      await rename(derivativeBackup, destinationDirectory);
    }
    if (sourceMoved && (await pathExists(processedSourcePath))) {
      await rename(processedSourcePath, resolvedInput);
    }
    await Promise.all([
      rm(manifestStaged, { force: true }),
      rm(manifestBackup, { force: true }),
      rm(derivativeBackup, { recursive: true, force: true }),
      discardPreparedPhotoDerivatives(prepared),
    ]);
    throw error;
  }
};

export const defaultPhotoProcessingPaths = {
  projectRoot: PROJECT_ROOT,
  sourceDirectory: SOURCE_DIRECTORY,
  inboxDirectory: SOURCE_INBOX_DIRECTORY,
  processedDirectory: SOURCE_PROCESSED_DIRECTORY,
  manifestPath: SOURCE_MANIFEST_PATH,
  portfolioDirectory: PORTFOLIO_DIRECTORY,
  catalogPath: CATALOG_PATH,
};
