import { describe, it, expect } from "vitest";
import { collides, findAutoPlacePosition, getDeviceDimensions } from "./siteLayoutUtils";
import type { PlacedDevice } from "./siteLayoutUtils";

const device = (x: number, y: number, rotated = false): PlacedDevice => ({
    instanceId: `test-${x}-${y}`,
    deviceId: "powerpack",
    x,
    y,
    rotated,
});

describe("collides", () => {
    it("detects overlap", () => {
        const placed = [device(0, 0)];
        expect(collides(placed, 5, 5, 10, 10)).toBe(true);
    });

    it("returns false when no overlap", () => {
        const placed = [device(0, 0)];
        expect(collides(placed, 20, 20, 10, 10)).toBe(false);
    });

    it("excludes the specified instanceId", () => {
        const p = device(0, 0);
        expect(collides([p], 0, 0, 10, 10, p.instanceId)).toBe(false);
    });
});

describe("getDeviceDimensions", () => {
    it("returns width and depth when not rotated", () => {
        const { w, h } = getDeviceDimensions(device(0, 0, false));
        expect(w).toBe(10);
        expect(h).toBe(10);
    });

    it("swaps dimensions when rotated", () => {
        const { w, h } = getDeviceDimensions(device(0, 0, true));
        expect(w).toBe(10);
        expect(h).toBe(10);
    });
});

describe("findAutoPlacePosition", () => {
    it("places first device at origin", () => {
        expect(findAutoPlacePosition([], 10, 10, 100, 60)).toEqual({ x: 0, y: 0 });
    });

    it("fills column before moving to next", () => {
        const placed: PlacedDevice[] = [
            { ...device(0, 0), instanceId: "a" },
            { ...device(0, 10), instanceId: "b" },
            { ...device(0, 20), instanceId: "c" },
        ];
        const pos = findAutoPlacePosition(placed, 10, 10, 100, 30);
        expect(pos).toEqual({ x: 10, y: 0 });
    });
});
