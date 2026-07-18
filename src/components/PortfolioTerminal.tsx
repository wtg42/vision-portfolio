import React from "react";
import {
  CATEGORY_LABELS,
  PHOTO_CATEGORIES,
  type PhotoCategory,
  type PhotoViewModel,
} from "../data/photos";

type ActiveCategory = "all" | PhotoCategory;

interface PortfolioTerminalProps {
  photos: PhotoViewModel[];
}

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export const resolveCategory = (
  value: string | null,
  availableCategories: PhotoCategory[],
): ActiveCategory => {
  const normalized = value?.trim().toLowerCase() as PhotoCategory | undefined;
  return normalized && availableCategories.includes(normalized)
    ? normalized
    : "all";
};

const PortfolioTerminal = ({ photos }: PortfolioTerminalProps) => {
  const availableCategories = React.useMemo(
    () =>
      PHOTO_CATEGORIES.filter((category) =>
        photos.some((photo) => photo.category === category)
      ),
    [photos],
  );
  const availableKey = availableCategories.join(",");
  const [activeCategory, setActiveCategory] =
    React.useState<ActiveCategory>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const openerRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get(
      "category",
    );
    setActiveCategory(resolveCategory(requestedCategory, availableCategories));
  }, [availableKey]);

  const filteredPhotos = React.useMemo(
    () =>
      activeCategory === "all"
        ? photos
        : photos.filter((photo) => photo.category === activeCategory),
    [activeCategory, photos],
  );
  const selectedIndex = filteredPhotos.findIndex(
    (photo) => photo.id === selectedId,
  );
  const selectedPhoto =
    selectedIndex >= 0 ? filteredPhotos[selectedIndex] : null;

  const closeViewer = React.useCallback((restoreFocus = true) => {
    const dialog = dialogRef.current;
    if (dialog?.open && typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog?.removeAttribute("open");
    }
    setSelectedId(null);

    if (restoreFocus) {
      window.setTimeout(() => openerRef.current?.focus(), 0);
    }
  }, []);

  React.useEffect(() => {
    if (!selectedPhoto) return;

    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    }
    closeButtonRef.current?.focus();
  }, [selectedPhoto]);

  React.useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeViewer();
        return;
      }

      if (event.key === "ArrowLeft" && selectedIndex > 0) {
        event.preventDefault();
        setSelectedId(filteredPhotos[selectedIndex - 1].id);
        return;
      }

      if (
        event.key === "ArrowRight" &&
        selectedIndex < filteredPhotos.length - 1
      ) {
        event.preventDefault();
        setSelectedId(filteredPhotos[selectedIndex + 1].id);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    closeViewer,
    filteredPhotos,
    selectedIndex,
    selectedPhoto,
  ]);

  const openViewer = (
    photoId: string,
    opener: HTMLButtonElement,
  ) => {
    openerRef.current = opener;
    setSelectedId(photoId);
  };

  const selectCategory = (category: ActiveCategory) => {
    if (selectedPhoto) closeViewer(false);
    setActiveCategory(category);

    const url = new URL(window.location.href);
    if (category === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", CATEGORY_LABELS[category]);
    }
    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  };

  return (
    <div className="terminal-page">
      <header className="terminal-header" aria-labelledby="portfolio-title">
        <div className="terminal-titlebar" aria-hidden="true">
          <span className="terminal-lights">
            <span />
            <span />
            <span />
          </span>
          <span>VISION_ARCHIVE — /dev/photography</span>
          <span className="terminal-status">ONLINE</span>
        </div>

        <nav className="terminal-nav" aria-label="Primary">
          <span className="terminal-prompt" aria-hidden="true">
            visitor@vision:~$
          </span>
          <a href="#works">./works</a>
          <a href="#about">./about</a>
        </nav>

        <div className="terminal-intro">
          <div className="boot-log" aria-label="System status">
            <p>
              <span>[ OK ]</span> loading visual memory
            </p>
            <p>
              <span>[ OK ]</span> mounting curated archive
            </p>
            <p>
              <span>[ {String(photos.length).padStart(2, "0")} ]</span>{" "}
              photographs indexed
            </p>
          </div>

          <div className="hero-copy">
            <p className="eyebrow">PERSONAL PHOTOGRAPHY ARCHIVE / TAIPEI</p>
            <h1 id="portfolio-title">
              VISION{" "}
              <span>PORTFOLIO</span>
            </h1>
            <p className="hero-description">
              歡迎進入我的視覺檔案庫。這裡保存城市、人物與風景留下的光線，
              每一格都是一段安靜的觀察紀錄。
            </p>
            <a className="terminal-cta" href="#works">
              <span aria-hidden="true">&gt;</span> browse_archive()
            </a>
          </div>

          <div className="system-readout" aria-hidden="true">
            <span>SYS.VSN.1984</span>
            <span>COLOR_MODE: TRUE</span>
            <span>ACCESS: PUBLIC</span>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="works-section" id="works" aria-labelledby="works-title">
          <div className="section-heading">
            <div>
              <p className="terminal-command">
                <span aria-hidden="true">visitor@vision:~$</span> ls ./works
              </p>
              <h2 id="works-title">Selected works</h2>
            </div>
            <p className="result-count" aria-live="polite">
              {String(filteredPhotos.length).padStart(2, "0")} file
              {filteredPhotos.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="filter-bar" aria-label="Filter photographs">
            <span className="filter-label" aria-hidden="true">
              filter:
            </span>
            {(["all", ...availableCategories] as ActiveCategory[]).map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  className="filter-command"
                  aria-pressed={activeCategory === category}
                  onClick={() => selectCategory(category)}
                >
                  [{category === "all" ? "all" : CATEGORY_LABELS[category]}]
                </button>
              ),
            )}
          </div>

          {filteredPhotos.length > 0 ? (
            <div className="works-grid">
              {filteredPhotos.map((photo, index) => (
                <article className="work-entry" key={photo.id}>
                  <button
                    type="button"
                    className="photo-card"
                    onClick={(event) =>
                      openViewer(photo.id, event.currentTarget)}
                  >
                    <span className="photo-index" aria-hidden="true">
                      /{String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="photo-frame">
                      <img
                        src={photo.thumbnail.src}
                        width={photo.thumbnail.width}
                        height={photo.thumbnail.height}
                        alt={photo.alt}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                      <span className="photo-scan" aria-hidden="true" />
                    </span>
                    <span className="photo-caption">
                      <span>
                        <strong>{photo.title}</strong>
                        {photo.location && <small>{photo.location}</small>}
                      </span>
                      <span className="file-type">
                        {CATEGORY_LABELS[photo.category]} / VIEW
                      </span>
                    </span>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state" role="status">
              ERR_NO_MATCH — no photographs found for this filter.
            </p>
          )}
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <p className="terminal-command">
            <span aria-hidden="true">visitor@vision:~$</span> cat ./about.txt
          </p>
          <div className="about-grid">
            <h2 id="about-title">
              Observing the space{" "}
              <span>between moments.</span>
            </h2>
            <div className="about-copy">
              <p>
                我喜歡在日常裡尋找那些容易被忽略的片刻：天色改變前的空氣、
                城市邊緣的安靜，以及人物沒有察覺鏡頭時最真實的神情。
              </p>
              <p>
                這個 archive 不追求完整，而是持續收錄值得被留下來的光。
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="terminal-footer">
        <span>VISION PORTFOLIO © {new Date().getFullYear()}</span>
        <span>
          STATUS: <strong>ARCHIVE READY</strong>
        </span>
        <a href="#portfolio-title">↑ return_to_top</a>
      </footer>

      <dialog
        ref={dialogRef}
        className="photo-viewer"
        aria-labelledby="viewer-title"
        onCancel={(event) => {
          event.preventDefault();
          closeViewer();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeViewer();
        }}
      >
        {selectedPhoto && (
          <div className="viewer-shell">
            <div className="viewer-titlebar">
              <span>
                OPEN /works/{selectedPhoto.id}.img
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                className="viewer-close"
                onClick={() => closeViewer()}
              >
                [ESC] CLOSE
              </button>
            </div>
            <div className="viewer-content">
              <div className="viewer-image">
                <img
                  src={selectedPhoto.full.src}
                  width={selectedPhoto.full.width}
                  height={selectedPhoto.full.height}
                  alt={selectedPhoto.alt}
                />
              </div>
              <aside className="viewer-meta">
                <p className="meta-label">FILE INFORMATION</p>
                <h2 id="viewer-title">{selectedPhoto.title}</h2>
                <dl>
                  <div>
                    <dt>Category</dt>
                    <dd>{CATEGORY_LABELS[selectedPhoto.category]}</dd>
                  </div>
                  {selectedPhoto.location && (
                    <div>
                      <dt>Location</dt>
                      <dd>{selectedPhoto.location}</dd>
                    </div>
                  )}
                  {selectedPhoto.year && (
                    <div>
                      <dt>Year</dt>
                      <dd>{selectedPhoto.year}</dd>
                    </div>
                  )}
                </dl>
                {selectedPhoto.description && (
                  <p className="viewer-description">
                    {selectedPhoto.description}
                  </p>
                )}
                <p className="viewer-position">
                  {String(selectedIndex + 1).padStart(2, "0")} /{" "}
                  {String(filteredPhotos.length).padStart(2, "0")}
                </p>
              </aside>
            </div>
            <div className="viewer-controls">
              <button
                type="button"
                disabled={selectedIndex <= 0}
                onClick={() =>
                  setSelectedId(filteredPhotos[selectedIndex - 1].id)}
              >
                ← PREV
              </button>
              <span>USE ARROW KEYS TO NAVIGATE</span>
              <button
                type="button"
                disabled={selectedIndex >= filteredPhotos.length - 1}
                onClick={() =>
                  setSelectedId(filteredPhotos[selectedIndex + 1].id)}
              >
                NEXT →
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
};

export default PortfolioTerminal;
