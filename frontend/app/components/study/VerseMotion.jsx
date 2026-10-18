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
      context.fillStyle = dark ? "#161719" : "#f5f6f7";
      context.fillRect(0, 0, width, height);
      // Fine threads rotate around one continuous wave, like the reference ribbon.
      for (let strand = 0; strand < 54; strand++) {
        const turn = strand / 54 * Math.PI * 2;
        const depth = (Math.cos(turn + phase) + 1) / 2;
        const shade = context.createLinearGradient(0, 0, width, height * .5);
        shade.addColorStop(0, dark ? `rgba(199,203,209,${.06 + depth * .12})` : `rgba(139,145,153,${.04 + depth * .08})`);
        shade.addColorStop(.55, dark ? `rgba(215,219,224,${.10 + depth * .20})` : `rgba(156,162,170,${.10 + depth * .18})`);
        shade.addColorStop(1, dark ? "rgba(195,201,208,.04)" : "rgba(144,150,158,.04)");
        context.strokeStyle = shade;
        context.lineWidth = depth > .8 ? 1.2 : .7;
        context.beginPath();
        for (let x = -4; x <= width + 4; x += 4) {
          const u = x / width;
          const envelope = .55 + .45 * Math.sin(u * Math.PI);
          const y = height * .39 + Math.sin(u * 6.5 + phase) * height * .13
            + Math.cos(turn + u * 5 - phase * .6) * height * .095 * envelope;
          if (x === -4) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.stroke();
      }
    };
    const tick = (now) => {
      if (now - previous >= 50) {
        phase += Math.min(now - previous, 100) * .00032;
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
