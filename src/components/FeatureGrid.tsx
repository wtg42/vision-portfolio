import React from "react";

/**
 * 首頁功能展示區塊
 */
const features = [
  { title: "Landscape", desc: "捕捉自然之美" },
  { title: "Portraits", desc: "展現人物情感" },
  { title: "Urban", desc: "城市街景故事" },
];

const FeatureGrid = () => (
  <section className="bg-base-200 py-12">
    <div className="container mx-auto px-4">
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 text-center rounded-lg shadow bg-base-100"
          >
            <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
            <p className="text-sm opacity-80">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureGrid;
