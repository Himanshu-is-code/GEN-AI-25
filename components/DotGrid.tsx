import React, { useRef, useEffect, useCallback, useMemo } from "react";

interface Dot {
  cx: number;
  cy: number;
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 2,
  gap = 24,
  baseColor = "#cccccc",
  className = "",
  style,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);

  const circlePath = useMemo(() => {
    if (typeof window === "undefined" || !window.Path2D) return null;
    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    const cols = Math.floor((width + gap) / (dotSize + gap));
    const rows = Math.floor((height + gap) / (dotSize + gap));
    const cell = dotSize + gap;

    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;

    const extraX = width - gridW;
    const extraY = height - gridH;

    const startX = extraX / 2 + dotSize / 2;
    const startY = extraY / 2 + dotSize / 2;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;
        dots.push({ cx, cy });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    if (!circlePath) return;
    
    let rafId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const dot of dotsRef.current) {
        const ox = dot.cx;
        const oy = dot.cy;
        
        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = baseColor;
        ctx.fill(circlePath);
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [baseColor, circlePath]);

  useEffect(() => {
    buildGrid();
    const wrapperElement = wrapperRef.current;

    // Exit if not in a browser environment or if the element is not yet available.
    if (typeof window === 'undefined' || !wrapperElement) {
      return;
    }

    // Use ResizeObserver if available. The `in` operator can cause issues with TS's
    // control flow analysis if the DOM typings assume ResizeObserver always exists,
    // making it think the `else` block is unreachable.
    // Checking the property on an `any`-casted window is a safer cross-environment way.
    const win = window as any;
    if (win.ResizeObserver) {
      const ro = new win.ResizeObserver(buildGrid);
      ro.observe(wrapperElement);
      return () => {
        ro.unobserve(wrapperElement);
      };
    } else {
      window.addEventListener("resize", buildGrid);
      return () => {
        window.removeEventListener("resize", buildGrid);
      };
    }
  }, [buildGrid]);

  return (
    <section
      className={`absolute inset-0 w-full h-full ${className}`}
      style={style}
    >
      <div ref={wrapperRef} className="w-full h-full relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>
    </section>
  );
};

export default DotGrid;