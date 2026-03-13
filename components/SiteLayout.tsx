"use client";

import { useRef, useState, useEffect, type SetStateAction } from "react";
import { DEVICES, type DeviceId } from "@/lib/devices";
import {
    type PlacedDevice,
    type DragState,
    getDeviceDimensions,
    collides,
    findBestPosition,
    isOverLimit,
} from "@/lib/siteLayoutUtils";

const COLORS: Record<DeviceId, string> = {
    megapackXL: "#3b82f6",
    megapack2: "#6366f1",
    megapack: "#8b5cf6",
    powerpack: "#10b981",
    transformer: "#f59e0b",
};

interface SiteLayoutProps {
    quantities: Record<DeviceId, number>;
    placed: PlacedDevice[];
    onPlacedChange: (action: SetStateAction<PlacedDevice[]>) => void;
    onDecrementQuantity: (deviceId: DeviceId) => void;
}

export default function SiteLayout({ quantities, placed, onPlacedChange, onDecrementQuantity }: SiteLayoutProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(8);
    const [height, setHeight] = useState(60);
    const [showGrid, setShowGrid] = useState(true);
    const dragRef = useRef<DragState | null>(null);
    const prevQuantitiesRef = useRef<Record<DeviceId, number>>(quantities);

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
        const prev = prevQuantitiesRef.current;
        prevQuantitiesRef.current = quantities;

        onPlacedChange((current) => {
            let updated = current;
            for (const deviceId of Object.keys(quantities) as DeviceId[]) {
                if ((quantities[deviceId] ?? 0) <= (prev[deviceId] ?? 0)) continue;
                const device = DEVICES.find((d) => d.id === deviceId)!;
                const alreadyPlaced = updated.filter((p) => p.deviceId === deviceId).length;
                const toAdd = (quantities[deviceId] ?? 0) - alreadyPlaced;
                for (let i = 0; i < toAdd; i++) {
                    const { x, y } = findBestPosition(updated, 0, 0, device.width, device.depth, 100, height);
                    updated = [...updated, { instanceId: `${deviceId}-${Date.now()}-${i}`, deviceId, x, y, rotated: false }];
                }
            }
            return updated;
        });
    }, [quantities]);

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
        const { w, h } = getDeviceDimensions(p);
        const x = Math.max(0, Math.min(startX + (e.clientX - startPointerX) / scale, 100 - w));
        const y = Math.max(0, Math.min(startY + (e.clientY - startPointerY) / scale, height - h));
        onPlacedChange((prev) => prev.map((item) => (item.instanceId === instanceId ? { ...item, x, y } : item)));
    }

    function endDrag(e: React.PointerEvent, instanceId: string) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        dragRef.current = null;
        onPlacedChange((prev) => {
            const p = prev.find((item) => item.instanceId === instanceId)!;
            const { w, h } = getDeviceDimensions(p);
            const { x, y } = findBestPosition(prev, p.x, p.y, w, h, 100, height, instanceId);
            return prev.map((item) => (item.instanceId === instanceId ? { ...item, x, y } : item));
        });
    }

    function rotateDevice(instanceId: string) {
        onPlacedChange((prev) =>
            prev.map((p) => {
                if (p.instanceId !== instanceId) return p;
                const device = DEVICES.find((d) => d.id === p.deviceId)!;
                const newRotated = !p.rotated;
                const w = newRotated ? device.depth : device.width;
                const h = newRotated ? device.width : device.depth;
                return {
                    ...p,
                    rotated: newRotated,
                    x: Math.max(0, Math.min(p.x, 100 - w)),
                    y: Math.max(0, Math.min(p.y, height - h)),
                };
            }),
        );
    }

    function removeDevice(instanceId: string) {
        const p = placed.find((item) => item.instanceId === instanceId)!;
        const placedCount = placed.filter((item) => item.deviceId === p.deviceId).length;
        if (placedCount <= (quantities[p.deviceId] ?? 0)) {
            onDecrementQuantity(p.deviceId);
        }
        onPlacedChange((prev) => prev.filter((item) => item.instanceId !== instanceId));
    }

    return (
        <div className="flex h-full flex-col gap-5 p-8" style={{ minWidth: 500 }}>
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

            <div className="flex-1 overflow-y-auto overflow-x-auto">
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
                        const { w, h } = getDeviceDimensions(p);
                        const device = DEVICES.find((d) => d.id === p.deviceId)!;
                        const overLimit = isOverLimit(placed, p, quantities);
                        const outOfBounds = p.x + w > 100 || p.y + h > height || p.x < 0 || p.y < 0;
                        const hasCollision = collides(placed, p.x, p.y, w, h, p.instanceId);
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
                                    opacity: overLimit ? 0.35 : 1,
                                    filter: overLimit ? "grayscale(1)" : "none",
                                    outline: outOfBounds || hasCollision ? "2px solid #ef4444" : "none",
                                }}
                                onPointerDown={(e) => startDrag(e, p.instanceId, p.x, p.y)}
                                onPointerMove={(e) => moveDrag(e, p.instanceId)}
                                onPointerUp={(e) => endDrag(e, p.instanceId)}
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
