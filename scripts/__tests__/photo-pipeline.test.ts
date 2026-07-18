// @vitest-environment node

import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, test } from "vitest";
import {
  optimizePhoto,
  PHOTO_VARIANTS,
  verifyPortfolioPhotos,
} from "../lib/photo-pipeline.mjs";

const temporaryDirectories: string[] = [];

const makeTemporaryDirectory = async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "photo-pipeline-"));
  temporaryDirectories.push(directory);
  return directory;
};

const makeJpeg = async (
  filePath: string,
  width: number,
  height: number,
  withExif = false,
) => {
  let image = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 120, g: 170, b: 220 },
    },
  });

  if (withExif) {
    image = image.withExif({
      IFD0: {
        Make: "Test Camera",
        Software: "Photo Pipeline Test",
      },
    });
  }

  await image.jpeg({ quality: 92 }).toFile(filePath);
};

const makeWebpPair = async (directory: string) => {
  await mkdir(directory, { recursive: true });
  await Promise.all([
    sharp({
      create: {
        width: 960,
        height: 320,
        channels: 3,
        background: "#78aadc",
      },
    })
      .webp({ quality: 80 })
      .toFile(path.join(directory, PHOTO_VARIANTS.thumbnail.filename)),
    sharp({
      create: {
        width: 1800,
        height: 600,
        channels: 3,
        background: "#78aadc",
      },
    })
      .webp({ quality: 88 })
      .toFile(path.join(directory, PHOTO_VARIANTS.full.filename)),
  ]);
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("optimizePhoto", () => {
  test("creates normalized WebP variants without enlarging the full image", async () => {
    const root = await makeTemporaryDirectory();
    const source = path.join(root, "source.jpg");
    const destinationRoot = path.join(root, "portfolio");
    await makeJpeg(source, 1200, 600, true);

    const result = await optimizePhoto({
      inputPath: source,
      slug: "city-light",
      destinationRoot,
    });

    expect(result.outputs.thumbnail).toMatchObject({
      width: 960,
      height: 480,
      format: "webp",
    });
    expect(result.outputs.full).toMatchObject({
      width: 1200,
      height: 600,
      format: "webp",
    });

    const fullMetadata = await sharp(result.outputs.full.path).metadata();
    expect(fullMetadata.exif).toBeUndefined();
    expect(fullMetadata.iptc).toBeUndefined();
    expect(fullMetadata.xmp).toBeUndefined();
    expect(fullMetadata.space).toBe("srgb");
  });

  test("does not enlarge a small source for either variant", async () => {
    const root = await makeTemporaryDirectory();
    const source = path.join(root, "small.jpg");
    await makeJpeg(source, 320, 200);

    const result = await optimizePhoto({
      inputPath: source,
      slug: "small-source",
      destinationRoot: path.join(root, "portfolio"),
    });

    expect(result.outputs.thumbnail).toMatchObject({ width: 320, height: 200 });
    expect(result.outputs.full).toMatchObject({ width: 320, height: 200 });
  });

  test("rejects invalid input without touching an existing pair", async () => {
    const root = await makeTemporaryDirectory();
    const destination = path.join(root, "portfolio", "existing-work");
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, "thumbnail.webp"), "old-thumbnail");
    await writeFile(path.join(destination, "full.webp"), "old-full");

    await expect(
      optimizePhoto({
        inputPath: path.join(root, "missing.jpg"),
        slug: "existing-work",
        destinationRoot: path.join(root, "portfolio"),
      }),
    ).rejects.toThrow();

    expect(await readFile(path.join(destination, "thumbnail.webp"), "utf8"))
      .toBe("old-thumbnail");
    expect(await readFile(path.join(destination, "full.webp"), "utf8"))
      .toBe("old-full");
  });

  test("keeps the previous pair when validation fails before commit", async () => {
    const root = await makeTemporaryDirectory();
    const source = path.join(root, "source.jpg");
    const destination = path.join(root, "portfolio", "existing-work");
    await makeJpeg(source, 1200, 600);
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, "thumbnail.webp"), "old-thumbnail");
    await writeFile(path.join(destination, "full.webp"), "old-full");

    await expect(
      optimizePhoto({
        inputPath: source,
        slug: "existing-work",
        destinationRoot: path.join(root, "portfolio"),
        beforeCommit: () => {
          throw new Error("simulated validation failure");
        },
      }),
    ).rejects.toThrow("simulated validation failure");

    expect(await readFile(path.join(destination, "thumbnail.webp"), "utf8"))
      .toBe("old-thumbnail");
    expect(await readFile(path.join(destination, "full.webp"), "utf8"))
      .toBe("old-full");
  });

  test("rejects non-kebab-case slugs before creating output", async () => {
    const root = await makeTemporaryDirectory();
    const source = path.join(root, "source.jpg");
    await makeJpeg(source, 640, 320);

    await expect(
      optimizePhoto({
        inputPath: source,
        slug: "Bad Slug",
        destinationRoot: path.join(root, "portfolio"),
      }),
    ).rejects.toThrow(/lowercase kebab-case/);

    await expect(stat(path.join(root, "portfolio"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
});

describe("verifyPortfolioPhotos", () => {
  const passingGitRunner = (args: string[]) => ({
    status: 0,
    stdout: args[0] === "ls-files" ? "" : "",
    stderr: "",
  });

  const makeProject = async () => {
    const root = await makeTemporaryDirectory();
    const portfolioDirectory = path.join(
      root,
      "src/assets/images/portfolio",
    );
    const catalogPath = path.join(root, "src/data/photos.ts");
    await makeWebpPair(path.join(portfolioDirectory, "city-light"));
    await mkdir(path.dirname(catalogPath), { recursive: true });
    await writeFile(
      catalogPath,
      [
        'import thumbnail from "../assets/images/portfolio/city-light/thumbnail.webp";',
        'import full from "../assets/images/portfolio/city-light/full.webp";',
        "export const photos = [{ thumbnail, full }];",
      ].join("\n"),
    );
    return { root, portfolioDirectory, catalogPath };
  };

  test("accepts a complete catalog derivative pair without originals", async () => {
    const project = await makeProject();

    const results = await verifyPortfolioPhotos({
      projectRoot: project.root,
      portfolioDirectory: project.portfolioDirectory,
      catalogPath: project.catalogPath,
      gitRunner: passingGitRunner,
    });

    expect(results).toHaveLength(2);
    expect(results.map((result) => result.variant)).toEqual([
      "thumbnail",
      "full",
    ]);
  });

  test("reports a missing derivative with its work slug", async () => {
    const project = await makeProject();
    await rm(
      path.join(project.portfolioDirectory, "city-light/full.webp"),
    );

    await expect(
      verifyPortfolioPhotos({
        projectRoot: project.root,
        portfolioDirectory: project.portfolioDirectory,
        catalogPath: project.catalogPath,
        gitRunner: passingGitRunner,
      }),
    ).rejects.toThrow(/city-light:.*full\.webp|missing asset/s);
  });

  test("rejects tracked source formats in the portfolio tree", async () => {
    const project = await makeProject();

    await expect(
      verifyPortfolioPhotos({
        projectRoot: project.root,
        portfolioDirectory: project.portfolioDirectory,
        catalogPath: project.catalogPath,
        gitRunner: (args) => ({
          status: 0,
          stdout:
            args[0] === "ls-files"
              ? "src/assets/images/portfolio/city-light/original.jpg\0"
              : "",
          stderr: "",
        }),
      }),
    ).rejects.toThrow(/Tracked source format is prohibited/);
  });

  test("rejects a malformed WebP variant", async () => {
    const project = await makeProject();
    await writeFile(
      path.join(project.portfolioDirectory, "city-light/thumbnail.webp"),
      "not-an-image",
    );

    await expect(
      verifyPortfolioPhotos({
        projectRoot: project.root,
        portfolioDirectory: project.portfolioDirectory,
        catalogPath: project.catalogPath,
        gitRunner: passingGitRunner,
      }),
    ).rejects.toThrow(/city-light/);
  });
});
