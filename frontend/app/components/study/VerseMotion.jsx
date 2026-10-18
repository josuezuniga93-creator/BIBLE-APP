"use client";

import { useEffect, useRef } from "react";

export default function VerseMotion({ dark, motion }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let visible = true;
    let previous = 0;
    let phase = 0;
    let width = 1;
    let height = 1;
    const draw = () => {
      context.fillStyle = dark ? "#151719" : "#f4f5f6";
      context.fillRect(0, 0, width, height);
      // Broad, layered ribbons keep the motion continuous without bright flashes.
      for (let band = -2; band < 7; band++) {
        const center = (band / 5) * height;
        const shade = context.createLinearGradient(0, center - height * .15, 0, center + height * .22);
        shade.addColorStop(0, "transparent");
        shade.addColorStop(.52, dark ? "rgba(192,199,204,.12)" : "rgba(75,85,93,.12)");
        shade.addColorStop(1, "transparent");
        context.fillStyle = shade;
        context.beginPath();
        for (let x = 0; x <= width + 6; x += 6) {
          const y = center + Math.sin(x / width * 4 + phase + band * .55) * height * .085 + x * .16;
          if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        for (let x = width + 6; x >= 0; x -= 6) {
          const y = center + Math.sin(x / width * 4 + phase + band * .55 + .65) * height * .085 + x * .16 + height * .24;
          context.lineTo(x, y);
        }
        context.closePath();
        context.fill();
      }
    };
    const tick = (now) => {
      if (now - previous >= 50) {
        phase += Math.min(now - previous, 100) * .00016;
        previous = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      draw();
      if (motion && visible && !document.hidden) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const resize = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      sync();
    });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    resize.observe(canvas);
    observer.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [dark, motion]);
  return <canvas ref={ref} className="verse-motion" aria-hidden="true" />;
}
