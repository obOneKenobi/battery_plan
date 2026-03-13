"use client";

import { useRef, useState, useEffect } from "react";
import { DEVICES, type DeviceId } from "@/lib/devices";

interface PlacedDevice {
  instanceId: string;
  deviceId: DeviceId;
  x: number;
  y: number;
  rotated: boolean;
  overLimit: boolean;
}

interface DragState {
  instanceId: string;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
}

const COLORS: Record<DeviceId, string> = {
  megapackXL: "#3b82f6",
  megapack2: "#6366f1",
  megapack: "#8b5cf6",
  powerpack: "#10b981",
  transformer: "#f59e0b",
};

interface SiteLayoutProps {
  quantities: Record<DeviceId, number>;
}

export default function SiteLayout({ quantities }: SiteLayoutProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(8);
  const [height, setHeight] = useState(60);
  const [showGrid, setShowGrid] = useState(true);
  const [placed, setPlaced] = useState<PlacedDevice[]>([]);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 100);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setPlaced((prev) => {
      const counts: Partial<Record<DeviceId, number>> = {};
      return prev.map((p) => {
        counts[p.deviceId] = (counts[p.deviceId] ?? 0) + 1;
        const overLimit = counts[p.deviceId]! > (quantities[p.deviceId] ?? 0);
        return overLimit === p.overLimit ? p : { ...p, overLimit };
      });
    });
  }, [quantities]);

  const placedCounts = placed.reduce<Partial<Record<DeviceId, number>>>((acc, p) => {
    acc[p.deviceId] = (acc[p.deviceId] ?? 0) + 1;
    return acc;
  }, {});

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const deviceId = e.dataTransfer.getData("deviceId") as DeviceId;
    if (!deviceId) return;
    const device = DEVICES.find((d) => d.id === deviceId);
    if (!device) return;
    if ((placedCounts[deviceId] ?? 0) >= (quantities[deviceId] ?? 0)) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min((e.clientX - rect.left) / scale - device.width / 2, 100 - device.width));
    const y = Math.max(0, Math.min((e.clientY - rect.top) / scale - device.depth / 2, height - device.depth));

    setPlaced((prev) => [...prev, { instanceId: `${deviceId}-${Date.now()}`, deviceId, x, y, rotated: false, overLimit: false }]);
  }

  function startDrag(e: React.PointerEvent, instanceId: string, currentX: number, currentY: number) {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      instanceId,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: currentX,
      startY: currentY,
    };
  }

  function moveDrag(e: React.PointerEvent, instanceId: string) {
    if (!dragRef.current || dragRef.current.instanceId !== instanceId) return;
    const { startPointerX, startPointerY, startX, startY } = dragRef.current;
    const p = placed.find((item) => item.instanceId === instanceId)!;
    const device = DEVICES.find((d) => d.id === p.deviceId)!;
    const w = p.rotated ? device.depth : device.width;
    const h = p.rotated ? device.width : device.depth;
    const x = Math.max(0, Math.min(startX + (e.clientX - startPointerX) / scale, 100 - w));
    const y = Math.max(0, Math.min(startY + (e.clientY - startPointerY) / scale, height - h));
    setPlaced((prev) => prev.map((item) => (item.instanceId === instanceId ? { ...item, x, y } : item)));
  }

  function endDrag(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
  }

  function rotateDevice(instanceId: string) {
    setPlaced((prev) =>
      prev.map((p) => {
        if (p.instanceId !== instanceId) return p;
        const device = DEVICES.find((d) => d.id === p.deviceId)!;
        const newRotated = !p.rotated;
        const w = newRotated ? device.depth : device.width;
        const h = newRotated ? device.width : device.depth;
        return {
          ...p,
          rotated: newRotated,
          x: Math.min(p.x, 100 - w),
          y: Math.min(p.y, height - h),
        };
      })
    );
  }

  function removeDevice(instanceId: string) {
    setPlaced((prev) => prev.filter((p) => p.instanceId !== instanceId));
  }

  return (
    <div className="flex h-full flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Site Layout</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGrid((v) => !v)}
            className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
              showGrid
                ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                : "border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 dark:border-zinc-800 dark:text-zinc-600 dark:hover:text-zinc-400"
            }`}
          >
            Grid
          </button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Height: {height}ft</span>
          <input
            type="range"
            min={20}
            max={300}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-32 accent-zinc-700 dark:accent-zinc-300"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div
          ref={canvasRef}
          className="relative w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
          style={{
            height: height * scale,
            backgroundImage: showGrid
              ? `linear-gradient(to right, #d1d5db 1px, transparent 1px), linear-gradient(to bottom, #d1d5db 1px, transparent 1px)`
              : "none",
            backgroundSize: `${scale * 10}px ${scale * 10}px`,
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {Array.from({ length: 11 }, (_, i) => i * 10).map((ft) => (
            <span
              key={ft}
              className="pointer-events-none absolute top-1 text-[10px] text-zinc-400 dark:text-zinc-600"
              style={{ left: ft * scale + 2 }}
            >
              {ft}ft
            </span>
          ))}

          {placed.map((p) => {
            const device = DEVICES.find((d) => d.id === p.deviceId)!;
            const w = p.rotated ? device.depth : device.width;
            const h = p.rotated ? device.width : device.depth;
            return (
              <div
                key={p.instanceId}
                className="group absolute flex cursor-grab items-center justify-center overflow-hidden rounded-sm text-white select-none active:cursor-grabbing"
                style={{
                  left: p.x * scale,
                  top: p.y * scale,
                  width: w * scale,
                  height: h * scale,
                  backgroundColor: COLORS[p.deviceId],
                  opacity: p.overLimit ? 0.35 : 1,
                  filter: p.overLimit ? "grayscale(1)" : "none",
                }}
                onPointerDown={(e) => startDrag(e, p.instanceId, p.x, p.y)}
                onPointerMove={(e) => moveDrag(e, p.instanceId)}
                onPointerUp={endDrag}
              >
                <span className="truncate px-1 text-xs font-medium">{device.name}</span>
                <button
                  className="absolute left-0.5 top-0.5 hidden h-4 w-4 items-center justify-center rounded-full bg-black/25 text-[11px] hover:bg-black/50 group-hover:flex"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => rotateDevice(p.instanceId)}
                >
                  ↻
                </button>
                <button
                  className="absolute right-0.5 top-0.5 hidden h-4 w-4 items-center justify-center rounded-full bg-black/25 text-[11px] hover:bg-black/50 group-hover:flex"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => removeDevice(p.instanceId)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
