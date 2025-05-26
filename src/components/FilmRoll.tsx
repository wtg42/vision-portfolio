import type { ImageMetadata } from "astro";
import React from "react";

/**
 * FilmRoll 膠卷底片元件
 */
const FilmRoll: React.FC<{ images: ImageMetadata[] }> = (
  { images }: { images: ImageMetadata[] },
) => {
  const [holeCount, setHoleCount] = React.useState(0);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      // entry.contentRect 是尺寸資訊
      const width = entry.contentRect.width;
      const count = Math.floor(width / 20); // 每個孔寬約 16~20px
      setHoleCount(count);
    });
    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect(); // 清除監聽器
  }, []);
  return (
    <>
      <div
        ref={ref}
        className="
          flex
          flex-row
          justify-center
          h-6
          bg-[#5c4033]
        "
      >
        <div className="flex space-x-2 items-center">
          {[...Array(holeCount)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-4 bg-white rounded-sm"
            />
          ))}
        </div>
      </div>
      <div
        data-role="film-body"
        className="
          flex
          flex-row
          justify-start
          items-center
          h-32
          bg-[#5c4033]
        "
      >
        <div className="">
          <img
            src={images[0].src}
            className="max-h-20 object-contain"
          />
        </div>
      </div>
      <div
        ref={ref}
        className="
          flex
          flex-row
          justify-center
          h-6
          bg-[#5c4033]
        "
      >
        <div className="
          flex
          space-x-2
          items-center
        ">
          {[...Array(holeCount)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-4 bg-white rounded-sm"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default FilmRoll;
