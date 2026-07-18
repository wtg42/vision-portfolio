import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import PortfolioTerminal, { resolveCategory } from "../PortfolioTerminal";
import type { PhotoViewModel } from "../../data/photos";

const makePhoto = (
  overrides: Partial<PhotoViewModel> = {},
): PhotoViewModel => ({
  id: "taipei-dawn",
  title: "Taipei Dawn",
  category: "urban",
  alt: "Taipei skyline at dawn",
  location: "Taipei, Taiwan",
  description: "Morning light across the city.",
  thumbnail: {
    src: "/taipei-thumb.webp",
    width: 960,
    height: 320,
  },
  full: {
    src: "/taipei-full.webp",
    width: 2000,
    height: 667,
  },
  ...overrides,
});

const photos: PhotoViewModel[] = [
  makePhoto(),
  makePhoto({
    id: "mountain-light",
    title: "Mountain Light",
    category: "landscape",
    alt: "Sunlight crossing a mountain ridge",
    location: undefined,
    description: undefined,
    thumbnail: {
      src: "/mountain-thumb.webp",
      width: 960,
      height: 640,
    },
    full: {
      src: "/mountain-full.webp",
      width: 1800,
      height: 1200,
    },
  }),
];

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: vi.fn(function showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    }),
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: vi.fn(function close(this: HTMLDialogElement) {
      this.removeAttribute("open");
    }),
  });
});

beforeEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("terminal portfolio", () => {
  test("renders the terminal shell, sections, and optimized thumbnails", () => {
    const { container } = render(<PortfolioTerminal photos={photos} />);

    const identityHeadings = screen.getAllByRole("heading", {
      name: /vision portfolio/i,
    });
    expect(identityHeadings).toHaveLength(1);
    expect(identityHeadings[0]).toHaveTextContent("VISION PORTFOLIO");
    expect(screen.getByRole("link", { name: "./works" })).toHaveAttribute(
      "href",
      "#works",
    );
    expect(screen.getByRole("heading", { name: "Selected works" }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Observing the space/i }))
      .toBeInTheDocument();

    const firstImage = screen.getByAltText("Taipei skyline at dawn");
    const secondImage = screen.getByAltText(
      "Sunlight crossing a mountain ridge",
    );
    expect(firstImage).toHaveAttribute("src", "/taipei-thumb.webp");
    expect(firstImage).toHaveAttribute("loading", "eager");
    expect(secondImage).toHaveAttribute("loading", "lazy");
    expect(container.querySelector(".viewer-image img")).toBeNull();
  });

  test("filters without navigation and exposes selected state", async () => {
    render(<PortfolioTerminal photos={photos} />);

    fireEvent.click(screen.getByRole("button", { name: "[Landscape]" }));

    expect(
      screen.queryByText("Taipei Dawn", { selector: "strong" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Mountain Light", { selector: "strong" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "[Landscape]" }))
      .toHaveAttribute("aria-pressed", "true");
    expect(window.location.search).toBe("?category=Landscape");
  });

  test("initializes a recognized URL category and falls back for unknown values", async () => {
    window.history.replaceState({}, "", "/?category=Urban");
    const { unmount } = render(<PortfolioTerminal photos={photos} />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "[Urban]" }))
        .toHaveAttribute("aria-pressed", "true")
    );
    expect(
      screen.queryByText("Mountain Light", { selector: "strong" }),
    ).not.toBeInTheDocument();

    unmount();
    window.history.replaceState({}, "", "/?category=Unknown");
    render(<PortfolioTerminal photos={photos} />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "[all]" }))
        .toHaveAttribute("aria-pressed", "true")
    );
    expect(screen.getByText("02 files")).toBeInTheDocument();
  });

  test("shows an intentional empty catalog state", () => {
    render(<PortfolioTerminal photos={[]} />);

    expect(
      screen.getByText(/ERR_NO_MATCH — no photographs found/i),
    ).toHaveAttribute("role", "status");
    expect(screen.queryByRole("button", { name: "[Urban]" }))
      .not.toBeInTheDocument();
  });
});

describe("photo viewer", () => {
  test("opens a full image, omits unavailable metadata, and respects edges", () => {
    render(<PortfolioTerminal photos={photos} />);

    fireEvent.click(screen.getByText("Mountain Light", { selector: "strong" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByAltText("Sunlight crossing a mountain ridge"))
      .toHaveAttribute("src", "/mountain-full.webp");
    expect(within(dialog).queryByText("Location")).not.toBeInTheDocument();
    expect(within(dialog).queryByText("Year")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "NEXT →" }))
      .toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "← PREV" }))
      .toBeEnabled();
  });

  test("supports controls, arrow keys, Escape, and focus restoration", async () => {
    render(<PortfolioTerminal photos={photos} />);
    const opener = screen.getByText("Taipei Dawn", {
      selector: "strong",
    }).closest("button") as HTMLButtonElement;

    fireEvent.click(opener);
    expect(screen.getByRole("heading", { name: "Taipei Dawn" }))
      .toBeInTheDocument();

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { name: "Mountain Light" }))
      .toBeInTheDocument();

    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(screen.getByRole("heading", { name: "Taipei Dawn" }))
      .toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(opener).toHaveFocus());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("closes an open viewer before changing the active filter", async () => {
    render(<PortfolioTerminal photos={photos} />);

    fireEvent.click(screen.getByText("Taipei Dawn", { selector: "strong" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "[Landscape]" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "[Landscape]" }))
      .toHaveAttribute("aria-pressed", "true");
  });
});

test("resolves category values case-insensitively", () => {
  expect(resolveCategory("Urban", ["urban"])).toBe("urban");
  expect(resolveCategory("unknown", ["urban"])).toBe("all");
  expect(resolveCategory(null, ["urban"])).toBe("all");
});
