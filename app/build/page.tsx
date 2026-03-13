"use client";

import { useState } from "react";
import { DEVICES, type DeviceId } from "@/lib/devices";

export default function BuildPage() {
  const [quantities, setQuantities] = useState<Record<DeviceId, number>>(
    Object.fromEntries(DEVICES.map((d) => [d.id, 0])) as Record<DeviceId, number>
  );

  const totalBudget = DEVICES.reduce(
    (sum, device) => sum + device.price * quantities[device.id],
    0
  );

  const totalMWh = DEVICES.reduce(
    (sum, device) => sum + device.energyMWh * quantities[device.id],
    0
  );

  const hasSelection = Object.values(quantities).some((q) => q > 0);

  function setQuantity(id: DeviceId, value: number) {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, value) }));
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <aside className="flex w-72 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
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
                  {device.dimension} · {device.energyCost}
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

      <main className="flex-1 p-10">
      </main>
    </div>
  );
}
