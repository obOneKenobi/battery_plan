import { DEVICES, type DeviceId } from "@/lib/devices";

export interface PlacedDevice {
  instanceId: string;
  deviceId: DeviceId;
  x: number;
  y: number;
  rotated: boolean;
}

export function isOverLimit(
  placed: PlacedDevice[],
  p: PlacedDevice,
  quantities: Record<DeviceId, number>
) {
  const index = placed.filter((item) => item.deviceId === p.deviceId).indexOf(p);
  return index >= (quantities[p.deviceId] ?? 0);
}

export interface DragState {
  instanceId: string;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
}

export function getDeviceDimensions(p: PlacedDevice) {
  const device = DEVICES.find((d) => d.id === p.deviceId)!;
  return {
    w: p.rotated ? device.depth : device.width,
    h: p.rotated ? device.width : device.depth,
  };
}

export function collides(
  placed: PlacedDevice[],
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  excludeId?: string
) {
  return placed.some((p) => {
    if (p.instanceId === excludeId) return false;
    const { w: bw, h: bh } = getDeviceDimensions(p);
    return ax < p.x + bw && ax + aw > p.x && ay < p.y + bh && ay + ah > p.y;
  });
}

export function findAutoPlacePosition(
  placed: PlacedDevice[],
  w: number,
  h: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  for (let x = 0; x + w <= canvasWidth; x++) {
    for (let y = 0; y + h <= canvasHeight; y++) {
      if (!collides(placed, x, y, w, h)) return { x, y };
    }
  }
  return { x: 0, y: 0 };
}

export function findBestPosition(
  placed: PlacedDevice[],
  targetX: number,
  targetY: number,
  w: number,
  h: number,
  canvasWidth: number,
  canvasHeight: number,
  excludeId?: string
) {
  const clampX = (x: number) => Math.max(0, Math.min(x, canvasWidth - w));
  const clampY = (y: number) => Math.max(0, Math.min(y, canvasHeight - h));

  const x0 = clampX(targetX);
  const y0 = clampY(targetY);

  if (!collides(placed, x0, y0, w, h, excludeId)) return { x: x0, y: y0 };

  const maxDist = Math.max(canvasWidth, canvasHeight);

  for (let dist = 1; dist <= maxDist; dist++) {
    const axisAligned = [
      { x: x0, y: clampY(y0 + dist) },
      { x: x0, y: clampY(y0 - dist) },
      { x: clampX(x0 + dist), y: y0 },
      { x: clampX(x0 - dist), y: y0 },
    ];
    for (const { x, y } of axisAligned) {
      if (!collides(placed, x, y, w, h, excludeId)) return { x, y };
    }

    const steps = Math.ceil(2 * Math.PI * dist);
    const diagonals = Array.from({ length: steps }, (_, i) => {
      const angle = (2 * Math.PI * i) / steps;
      const ax = Math.abs(Math.cos(angle));
      const ay = Math.abs(Math.sin(angle));
      if (ax < 0.1 || ay < 0.1) return null;
      return { x: clampX(x0 + Math.cos(angle) * dist), y: clampY(y0 + Math.sin(angle) * dist) };
    }).filter(Boolean) as { x: number; y: number }[];

    diagonals.sort((a, b) => (a.x - x0) ** 2 + (a.y - y0) ** 2 - (b.x - x0) ** 2 - (b.y - y0) ** 2);
    for (const { x, y } of diagonals) {
      if (!collides(placed, x, y, w, h, excludeId)) return { x, y };
    }
  }

  return { x: x0, y: y0 };
}
