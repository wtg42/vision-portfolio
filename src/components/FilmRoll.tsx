import type { ImageMetadata } from "astro";
import React from "react";

/**
 * FilmRoll 膠卷底片元件
 */
const FilmRoll: React.FC<{ images: ImageMetadata[]; category?: string }> = (
  { images, category }: { images: ImageMetadata[]; category?: string },
) => {
  const [holeCount, setHoleCount] = React.useState(0); // 紀錄孔洞數量
  const [currentImage, setCurrentImage] = React.useState<string | null>(null); // 被點擊的圖片
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      // entry.contentRect 是尺寸資訊
      const width = entry.contentRect.width;
      const count = Math.floor(width / 20); // 每個孔寬約 16~20px
      setHoleCount(count);
    });
    if (ref.current) observer.observe(ref.current); // 監聽外層容器寬度

    return () => observer.disconnect(); // 清除監聽器
  }, []);

  /**
   * 點擊圖片的顯示整張圖片
   */
  const handleClickImage = (src: string) => {
    setCurrentImage(src);
    const modal = document.getElementById("show_image_modal") as HTMLDialogElement;
    modal?.showModal();
  };

  return (
    <>
      {category && (
        <h2 className="text-center text-2xl my-4">{category}</h2>
      )}
      <div ref={ref} className="mx-4 inline-block">
        {/* 上方孔洞列 */}
        <div
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
        {/* 主要底片區域 */}
        <div
          data-role="film-body"
          className="
            flex
            flex-row
            justify-start
            items-center
            h-24
            bg-[#5c4033]
            px-2
            gap-2
          "
        >
          {images.map((img, i) => (
            <img
              key={i}
              src={img.src}
              className="h-full object-cover"
              onClick={() => handleClickImage(img.src)}
            />
          ))}
        </div>
        {/* 下方孔洞列 */}
        <div
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
      </div>
      <dialog id="show_image_modal" className="modal">
        {currentImage && (
          <div className="modal-box w-11/12 max-w-5xl">
            <img src={currentImage} alt="" />
          </div>
        )}
        <form method="dialog" className="modal-backdrop">
          {/* if there is a button in form, it will close the modal */}
          <button>Close</button>
        </form>
      </dialog>
    </>
  );
};

export default FilmRoll;
