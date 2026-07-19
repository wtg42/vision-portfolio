// @vitest-environment node

import {
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, test } from "vitest";
import {
  createEmptyPhotoManifest,
  getManagedPhotoPaths,
  getPhotoPipelineFingerprint,
  getPhotoProcessingStatus,
  hashFileSha256,
  PHOTO_MANIFEST_VERSION,
  processPhoto,
  readPhotoManifest,
  validatePhotoManifest,
  writePhotoManifestAtomic,
} from "../lib/photo-processing-state.mjs";

const temporaryDirectories: string[] = [];

const makeTemporaryDirectory = async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "photo-state-"));
  temporaryDirectories.push(directory);
  return directory;
};

const makeJpeg = async (
  filePath: string,
  color: { r: number; g: number; b: number } = {
    r: 120,
    g: 170,
    b: 220,
  },
) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  await sharp({
    create: {
      width: 1200,
      height: 600,
      channels: 3,
      background: color,
    },
  })
    .jpeg({ quality: 92 })
    .toFile(filePath);
};

const makeProject = async () => {
  const root = await makeTemporaryDirectory();
  const sourceDirectory = path.join(root, "photo-sources");
  const paths = getManagedPhotoPaths(sourceDirectory);
  const portfolioDirectory = path.join(
    root,
    "src/assets/images/portfolio",
  );
  const catalogPath = path.join(root, "src/data/photos.ts");
  await mkdir(paths.inboxDirectory, { recursive: true });
  await mkdir(path.dirname(catalogPath), { recursive: true });
  await writeFile(catalogPath, "export const photos = [];\n");
  return {
    root,
    portfolioDirectory,
    catalogPath,
    ...paths,
  };
};

const getProcessedSourcePath = (result: { sourcePath?: string }) => {
  if (!result.sourcePath) {
    throw new Error("Expected managed processing to return a source path");
  }
  return result.sourcePath;
};

const processInProject = async (
  project: Awaited<ReturnType<typeof makeProject>>,
  {
    filename = "city-light.jpg",
    slug = "city-light",
    replace = false,
    color,
    beforeTransactionStep,
  }: {
    filename?: string;
    slug?: string;
    replace?: boolean;
    color?: { r: number; g: number; b: number };
    beforeTransactionStep?: (step: string) => void | Promise<void>;
  } = {},
) => {
  const inputPath = path.join(project.inboxDirectory, filename);
  await makeJpeg(inputPath, color);
  const result = await processPhoto({
    inputPath,
    slug,
    replace,
    sourceDirectory: project.sourceDirectory,
    portfolioDirectory: project.portfolioDirectory,
    manifestPath: project.manifestPath,
    now: () => new Date("2026-07-19T00:00:00.000Z"),
    beforeTransactionStep,
  });
  return { inputPath, result };
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("photo processing manifest", () => {
  test("hashes exact file bytes and exposes a stable pipeline fingerprint", async () => {
    const root = await makeTemporaryDirectory();
    const filePath = path.join(root, "value.txt");
    await writeFile(filePath, "vision");

    expect(await hashFileSha256(filePath)).toBe(
      "5944ae849448011ca08c3785f1de1a54c8a96d6c23f787f9d962b624edd4151d",
    );
    expect(getPhotoPipelineFingerprint()).toMatch(/^[a-f0-9]{64}$/);
    expect(getPhotoPipelineFingerprint()).toBe(getPhotoPipelineFingerprint());
  });

  test("writes and reads a valid version 1 manifest atomically", async () => {
    const project = await makeProject();
    const empty = createEmptyPhotoManifest();
    await writePhotoManifestAtomic(empty, {
      manifestPath: project.manifestPath,
    });

    expect(await readPhotoManifest({ manifestPath: project.manifestPath }))
      .toEqual({
        version: PHOTO_MANIFEST_VERSION,
        entries: {},
      });
  });

  test("rejects unsupported and malformed manifest data", () => {
    expect(() =>
      validatePhotoManifest({ version: 2, entries: {} }),
    ).toThrow(/Unsupported photo manifest version/);
    expect(() =>
      validatePhotoManifest({
        version: 1,
        entries: {
          "city-light": {
            slug: "city-light",
          },
        },
      }),
    ).toThrow(/source/);
  });
});

describe("managed photo processing", () => {
  test("processes an inbox source into derivatives, processed storage, and manifest", async () => {
    const project = await makeProject();
    const { inputPath, result } = await processInProject(project);
    const sourcePath = getProcessedSourcePath(result);

    expect(result.status).toBe("processed");
    await expect(stat(inputPath)).rejects.toMatchObject({ code: "ENOENT" });
    expect(sourcePath).toContain(
      path.join("processed", "city-light"),
    );
    expect(path.basename(sourcePath)).toMatch(/^[a-f0-9]{12}\.jpg$/);
    await expect(stat(sourcePath)).resolves.toBeTruthy();
    await expect(
      stat(path.join(project.portfolioDirectory, "city-light/thumbnail.webp")),
    ).resolves.toBeTruthy();
    await expect(
      stat(path.join(project.portfolioDirectory, "city-light/full.webp")),
    ).resolves.toBeTruthy();

    const manifest = await readPhotoManifest({
      manifestPath: project.manifestPath,
    });
    expect(manifest.entries["city-light"]).toMatchObject({
      slug: "city-light",
      processedAt: "2026-07-19T00:00:00.000Z",
      pipeline: {
        version: "1",
        fingerprint: getPhotoPipelineFingerprint(),
      },
    });
    expect(manifest.entries["city-light"].source.sha256).toBe(
      await hashFileSha256(sourcePath),
    );
  });

  test("returns a no-op for identical source and derivative content", async () => {
    const project = await makeProject();
    const first = await processInProject(project);
    const firstSourcePath = getProcessedSourcePath(first.result);
    const duplicatePath = path.join(project.inboxDirectory, "duplicate.jpg");
    await copyFile(firstSourcePath, duplicatePath);
    const beforeManifest = await readFile(project.manifestPath, "utf8");

    const repeated = await processPhoto({
      inputPath: duplicatePath,
      slug: "city-light",
      sourceDirectory: project.sourceDirectory,
      portfolioDirectory: project.portfolioDirectory,
      manifestPath: project.manifestPath,
    });

    expect(repeated.status).toBe("already-processed");
    await expect(stat(duplicatePath)).resolves.toBeTruthy();
    expect(await readFile(project.manifestPath, "utf8")).toBe(beforeManifest);
  });

  test("requires explicit replacement and retains the superseded source", async () => {
    const project = await makeProject();
    const first = await processInProject(project);
    const firstSourcePath = getProcessedSourcePath(first.result);
    const replacementPath = path.join(
      project.inboxDirectory,
      "replacement.jpg",
    );
    await makeJpeg(replacementPath, { r: 220, g: 120, b: 90 });

    await expect(
      processPhoto({
        inputPath: replacementPath,
        slug: "city-light",
        sourceDirectory: project.sourceDirectory,
        portfolioDirectory: project.portfolioDirectory,
        manifestPath: project.manifestPath,
      }),
    ).rejects.toThrow(/--replace/);
    await expect(stat(replacementPath)).resolves.toBeTruthy();

    const replaced = await processPhoto({
      inputPath: replacementPath,
      slug: "city-light",
      replace: true,
      sourceDirectory: project.sourceDirectory,
      portfolioDirectory: project.portfolioDirectory,
      manifestPath: project.manifestPath,
    });

    expect(replaced.status).toBe("replaced");
    const replacedSourcePath = getProcessedSourcePath(replaced);
    expect(replacedSourcePath).not.toBe(firstSourcePath);
    await expect(stat(firstSourcePath)).resolves.toBeTruthy();
    await expect(stat(replacedSourcePath)).resolves.toBeTruthy();
  });

  test.each(["source", "derivatives", "manifest"])(
    "rolls back a first-time failure before the %s transaction step",
    async (failedStep) => {
      const project = await makeProject();
      const inputPath = path.join(project.inboxDirectory, "city-light.jpg");
      await makeJpeg(inputPath);

      await expect(
        processPhoto({
          inputPath,
          slug: "city-light",
          sourceDirectory: project.sourceDirectory,
          portfolioDirectory: project.portfolioDirectory,
          manifestPath: project.manifestPath,
          beforeTransactionStep: (step) => {
            if (step === failedStep) {
              throw new Error(`failed at ${step}`);
            }
          },
        }),
      ).rejects.toThrow(`failed at ${failedStep}`);

      await expect(stat(inputPath)).resolves.toBeTruthy();
      await expect(stat(project.manifestPath)).rejects.toMatchObject({
        code: "ENOENT",
      });
      await expect(
        stat(path.join(project.portfolioDirectory, "city-light")),
      ).rejects.toMatchObject({ code: "ENOENT" });
    },
  );

  test("restores existing derivatives and manifest when replacement commit fails", async () => {
    const project = await makeProject();
    const first = await processInProject(project);
    const firstSourcePath = getProcessedSourcePath(first.result);
    const thumbnailPath = path.join(
      project.portfolioDirectory,
      "city-light/thumbnail.webp",
    );
    const beforeManifest = await readFile(project.manifestPath, "utf8");
    const beforeThumbnailHash = await hashFileSha256(thumbnailPath);
    const replacementPath = path.join(
      project.inboxDirectory,
      "replacement.jpg",
    );
    await makeJpeg(replacementPath, { r: 10, g: 20, b: 30 });

    await expect(
      processPhoto({
        inputPath: replacementPath,
        slug: "city-light",
        replace: true,
        sourceDirectory: project.sourceDirectory,
        portfolioDirectory: project.portfolioDirectory,
        manifestPath: project.manifestPath,
        beforeTransactionStep: (step) => {
          if (step === "manifest") throw new Error("manifest unavailable");
        },
      }),
    ).rejects.toThrow("manifest unavailable");

    await expect(stat(replacementPath)).resolves.toBeTruthy();
    await expect(stat(firstSourcePath)).resolves.toBeTruthy();
    expect(await readFile(project.manifestPath, "utf8")).toBe(beforeManifest);
    expect(await hashFileSha256(thumbnailPath)).toBe(beforeThumbnailHash);
  });
});

describe("photo processing status", () => {
  test("reports processing and publication state independently", async () => {
    const project = await makeProject();
    await processInProject(project);
    await writeFile(
      project.catalogPath,
      'import image from "../assets/images/portfolio/city-light/full.webp";\n',
    );
    const newInboxPath = path.join(project.inboxDirectory, "new-photo.jpg");
    await makeJpeg(newInboxPath, { r: 10, g: 90, b: 140 });

    const statusReport = await getPhotoProcessingStatus({
      sourceDirectory: project.sourceDirectory,
      portfolioDirectory: project.portfolioDirectory,
      catalogPath: project.catalogPath,
      manifestPath: project.manifestPath,
    });

    expect(statusReport.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "city-light",
          state: "processed",
          published: true,
        }),
        expect.objectContaining({
          sourcePath: newInboxPath,
          state: "new",
          published: false,
        }),
      ]),
    );
    expect(statusReport.hasBroken).toBe(false);
  });

  test("reports source and pipeline changes separately from broken derivatives", async () => {
    const project = await makeProject();
    const processed = await processInProject(project);
    const processedSourcePath = getProcessedSourcePath(processed.result);
    const manifest = await readPhotoManifest({
      manifestPath: project.manifestPath,
    });
    manifest.entries["city-light"].pipeline.fingerprint = "0".repeat(64);
    await writePhotoManifestAtomic(manifest, {
      manifestPath: project.manifestPath,
    });

    let report = await getPhotoProcessingStatus({
      sourceDirectory: project.sourceDirectory,
      portfolioDirectory: project.portfolioDirectory,
      catalogPath: project.catalogPath,
      manifestPath: project.manifestPath,
    });
    expect(report.entries[0]).toMatchObject({
      state: "changed",
      issues: expect.arrayContaining(["pipeline fingerprint differs"]),
    });

    await writeFile(
      path.join(project.portfolioDirectory, "city-light/full.webp"),
      "broken",
    );
    report = await getPhotoProcessingStatus({
      sourceDirectory: project.sourceDirectory,
      portfolioDirectory: project.portfolioDirectory,
      catalogPath: project.catalogPath,
      manifestPath: project.manifestPath,
    });
    expect(report.entries[0].state).toBe("broken");
    expect(report.hasBroken).toBe(true);

    await writeFile(processedSourcePath, "changed source bytes");
    report = await getPhotoProcessingStatus({
      sourceDirectory: project.sourceDirectory,
      portfolioDirectory: project.portfolioDirectory,
      catalogPath: project.catalogPath,
      manifestPath: project.manifestPath,
    });
    expect(report.entries[0].issues).toContain("source SHA-256 differs");
  });
});
