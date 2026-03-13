"use client";

import { useState, useEffect, useRef, type SetStateAction } from "react";
import { DEVICES, type DeviceId } from "@/lib/devices";
import { type PlacedDevice } from "@/lib/siteLayoutUtils";
import SiteLayout from "@/components/SiteLayout";

interface BuildState {
  quantities: Record<DeviceId, number>;
  placed: PlacedDevice[];
}

const DEFAULT_STATE: BuildState = {
  quantities: Object.fromEntries(DEVICES.map((d) => [d.id, 0])) as Record<DeviceId, number>,
  placed: [],
};

export default function BuildPage() {
  const [state, setState] = useState<BuildState>(DEFAULT_STATE);
  const isFirstSaveRef = useRef(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("build-state");
      if (saved) setState(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (isFirstSaveRef.current) {
      isFirstSaveRef.current = false;
      return;
    }
    localStorage.setItem("build-state", JSON.stringify(state));
  }, [state]);

  const { quantities, placed } = state;

  const totalBudget = DEVICES.reduce(
    (sum, device) => sum + device.price * quantities[device.id],
    0
  );

  const totalMWh = DEVICES.reduce(
    (sum, device) => sum + device.energyMWh * quantities[device.id],
    0
  );

  const hasSelection = Object.values(quantities).some((q) => q > 0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function setQuantity(id: DeviceId, value: number) {
    setState((prev) => ({
      ...prev,
      quantities: { ...prev.quantities, [id]: Math.max(0, value) },
    }));
  }

  function setPlaced(action: SetStateAction<PlacedDevice[]>) {
    setState((prev) => ({
      ...prev,
      placed: typeof action === "function" ? action(prev.placed) : action,
    }));
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] bg-zinc-50 font-sans dark:bg-black">
      <aside className={`flex h-full shrink-0 flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden ${sidebarOpen ? "w-72" : "w-0"}`}>
        <div className="border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
          <h1 className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
            Build Your Plan
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Select devices and quantities.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {DEVICES.map((device, i) => (
            <div
              key={device.id}
              id={device.id}
              className={`px-5 py-4 ${
                i < DEVICES.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800/60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {device.name}
                  </span>
                  <sub className="text-[11px] leading-tight text-zinc-400 dark:text-zinc-500">
                    {device.releaseDate !== "—" ? `Released ${device.releaseDate}` : "No release date"}
                  </sub>
                </div>

                <div className="flex items-center gap-1 pt-px">
                  <button
                    onClick={() => setQuantity(device.id, quantities[device.id] - 1)}
                    disabled={quantities[device.id] === 0}
                    className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                    {quantities[device.id]}
                  </span>
                  <button
                    onClick={() => setQuantity(device.id, quantities[device.id] + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {device.width}FT x {device.depth}FT · {device.energyCost}
                </span>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  ${device.price.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={`border-t px-5 py-4 transition-all ${hasSelection ? "border-zinc-200 dark:border-zinc-800" : "border-transparent"}`}>
          {hasSelection ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Budget
                </p>
                <p className="mt-0.5 text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
                  ${totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Net Energy
                </p>
                <p className="mt-0.5 text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
                  {totalMWh % 1 !== 0 ? totalMWh.toFixed(1) : totalMWh} MWh
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
              Add devices to see your budget.
            </p>
          )}
        </div>
      </aside>

      <div className="relative flex flex-1 overflow-hidden">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-8 w-5 items-center justify-center rounded-r border border-l-0 border-zinc-200 bg-white text-xs text-zinc-400 hover:text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:text-zinc-200"
        >
          {sidebarOpen ? "‹" : "›"}
        </button>
        <main className="flex-1 overflow-hidden">
          <SiteLayout
            quantities={quantities}
            placed={placed}
            onPlacedChange={setPlaced}
            onDecrementQuantity={(id) => setQuantity(id, quantities[id] - 1)}
          />
        </main>
      </div>
    </div>
  );
}
