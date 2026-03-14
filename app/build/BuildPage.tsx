"use client";

import { useState, useEffect, useRef, type SetStateAction } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { DEVICES, type DeviceId } from "@/lib/devices";
import { type PlacedDevice } from "@/lib/siteLayoutUtils";
import SiteLayout from "@/components/SiteLayout";
import Toast from "@/components/Toast";

interface BuildState {
  quantities: Record<DeviceId, number>;
  placed: PlacedDevice[];
}

const DEFAULT_STATE: BuildState = {
  quantities: Object.fromEntries(DEVICES.map((d) => [d.id, 0])) as Record<DeviceId, number>,
  placed: [],
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function BuildPage() {
  const [state, setState] = useState<BuildState>(DEFAULT_STATE);
  const isFirstSaveRef = useRef(true);
  const { data: session } = useSession();
  const [planName, setPlanName] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam) {
      fetch(`/api/plans/${planParam}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          setState({ quantities: data.quantities, placed: data.placed });
          setPlanId(data._id);
          setPlanName(data.name);
        });
    } else {
      try {
        const saved = localStorage.getItem("build-state");
        if (saved) setState(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("plan")) return;
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

  const totalBatteries = (["megapackXL", "megapack2", "megapack", "powerpack"] as DeviceId[]).reduce(
    (sum, id) => sum + (quantities[id] ?? 0),
    0
  );
  const requiredTransformers = Math.ceil(totalBatteries / 2);
  const transformerShortfall = requiredTransformers - (quantities.transformer ?? 0);
  const transformerValid = totalBatteries === 0 || transformerShortfall <= 0;

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

  function clearPlan() {
    setState(DEFAULT_STATE);
    setPlanId(null);
    setPlanName("");
  }

  async function savePlan() {
    if (!session) {
      signIn();
      return;
    }
    setSaveStatus("saving");
    try {
      const body = { name: planName, quantities, placed };
      const res = planId
        ? await fetch(`/api/plans/${planId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) throw new Error();
      if (!planId) {
        const data = await res.json();
        setPlanId(data.id);
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] bg-zinc-50 font-sans dark:bg-black">
      <aside className={`flex h-full shrink-0 flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden ${sidebarOpen ? "w-72" : "w-0"}`}>
        <div className="border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
              Build Your Plan
            </h1>
            <button
              onClick={clearPlan}
              disabled={!hasSelection}
              className="rounded border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-400"
            >
              Clear
            </button>
          </div>
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

          {!transformerValid && (
            <p className="mt-4 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              {transformerShortfall === 1
                ? "Add 1 more transformer"
                : `Add ${transformerShortfall} more transformers`}{" "}
              ({requiredTransformers} required for {totalBatteries}{" "}
              {totalBatteries === 1 ? "battery" : "batteries"}).
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Plan name"
              className="w-full rounded border border-zinc-200 px-3 py-1.5 text-sm text-zinc-800 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-500"
            />
            <button
              onClick={savePlan}
              disabled={saveStatus === "saving" || !planName.trim() || !transformerValid}
              className="flex h-9 w-full items-center justify-center rounded bg-black text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
            >
              {saveStatus === "saving" && "Saving…"}
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "error" && "Error — try again"}
              {saveStatus === "idle" && (session ? (planId ? "Update plan" : "Save plan") : "Sign in to save")}
            </button>
          </div>
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
      <Toast message="Plan saved" show={saveStatus === "saved"} />
    </div>
  );
}
