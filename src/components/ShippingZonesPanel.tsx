import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Truck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatPrice, formatDate } from "@/lib/format";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { useShippingStore, type ShippingZone } from "@/stores/useShippingStore";

/**
 * The delivery rate table.
 *
 * Edits are held locally and committed in one Save, because a zone is only coherent
 * once its states and its fee are both set — saving on every keystroke would publish
 * a half-built zone to live checkouts.
 */
const ShippingZonesPanel = () => {
  const { settings, isLoadingSettings, isSaving, fetchSettings, saveSettings } =
    useShippingStore();

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [defaultFee, setDefaultFee] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Copied into local state on load, and again whenever a save returns the
  // server's canonical version.
  useEffect(() => {
    if (settings) {
      setZones(settings.zones.map((z) => ({ ...z, states: [...z.states] })));
      setDefaultFee(settings.defaultFee);
    }
  }, [settings]);

  const claimed = useMemo(
    () => new Set(zones.flatMap((zone) => zone.states)),
    [zones]
  );

  // Offered in the "add a state" dropdowns. A state already in some zone is absent
  // rather than shown-and-rejected, so the conflict the server guards against is one
  // the interface cannot express in the first place.
  const unassigned = useMemo(
    () => NIGERIAN_STATES.filter((state) => !claimed.has(state)),
    [claimed]
  );

  const isDirty = useMemo(() => {
    if (!settings) return false;
    return (
      JSON.stringify({ zones, defaultFee }) !==
      JSON.stringify({ zones: settings.zones, defaultFee: settings.defaultFee })
    );
  }, [zones, defaultFee, settings]);

  const patchZone = (index: number, patch: Partial<ShippingZone>) =>
    setZones((prev) => prev.map((z, i) => (i === index ? { ...z, ...patch } : z)));

  const addZone = () =>
    setZones((prev) => [...prev, { name: "", states: [], fee: 0 }]);

  const removeZone = (index: number) =>
    setZones((prev) => prev.filter((_, i) => i !== index));

  const addState = (index: number, state: string) => {
    if (!state) return;
    patchZone(index, { states: [...zones[index].states, state].sort() });
  };

  const removeState = (index: number, state: string) =>
    patchZone(index, { states: zones[index].states.filter((s) => s !== state) });

  const reset = () => {
    if (!settings) return;
    setZones(settings.zones.map((z) => ({ ...z, states: [...z.states] })));
    setDefaultFee(settings.defaultFee);
  };

  const handleSave = async () => {
    // Caught here as well as on the server so the admin gets the message beside the
    // field rather than as a rejected request.
    const unnamed = zones.findIndex((z) => !z.name.trim());
    if (unnamed !== -1) {
      toast.error(`Zone ${unnamed + 1} needs a name`);
      return;
    }

    try {
      await saveSettings(
        zones.map((z) => ({ ...z, name: z.name.trim() })),
        defaultFee
      );
      toast.success("Shipping rates updated");
    } catch (error: any) {
      toast.error(typeof error === "string" ? error : "Could not save the rates");
    }
  };

  if (isLoadingSettings && !settings) {
    return (
      <div className="grid place-items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="font-display text-xl font-extrabold text-surface-900">
            Delivery rates
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-surface-500">
            Group states into zones and set what each one costs to deliver to. A state
            in no zone is charged the "everywhere else" rate. Changes apply to carts
            and checkouts straight away.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <button onClick={reset} className="btn btn-secondary btn-sm">
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="btn btn-primary btn-sm"
          >
            {isSaving ? <LoadingSpinner size="sm" /> : "Save rates"}
          </button>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        <AnimatePresence initial={false}>
          {zones.map((zone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-[12rem] flex-1">
                  <label htmlFor={`zone-name-${index}`} className="label">
                    Zone name
                  </label>
                  <input
                    id={`zone-name-${index}`}
                    value={zone.name}
                    onChange={(e) => patchZone(index, { name: e.target.value })}
                    placeholder="Lagos"
                    maxLength={60}
                    className="field"
                  />
                </div>

                <div className="w-40">
                  <label htmlFor={`zone-fee-${index}`} className="label">
                    Fee
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-surface-400">
                      ₦
                    </span>
                    <input
                      id={`zone-fee-${index}`}
                      type="number"
                      min={0}
                      step={1}
                      value={zone.fee}
                      onChange={(e) =>
                        patchZone(index, { fee: Math.max(0, Math.floor(+e.target.value || 0)) })
                      }
                      className="field pl-7 tabular-nums"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeZone(index)}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-surface-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${zone.name || `zone ${index + 1}`}`}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>

              <div className="mt-5">
                <p className="label">States in this zone</p>
                <div className="flex flex-wrap items-center gap-2">
                  {zone.states.map((state) => (
                    <span
                      key={state}
                      className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-surface-50 py-1 pl-3 pr-1.5 text-[0.8125rem] text-surface-700"
                    >
                      {state}
                      <button
                        onClick={() => removeState(index, state)}
                        className="grid h-5 w-5 place-items-center rounded-full text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-900"
                        aria-label={`Remove ${state} from ${zone.name || "this zone"}`}
                      >
                        <X className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </span>
                  ))}

                  {zone.states.length === 0 && (
                    <span className="text-sm text-surface-400">
                      No states yet — this zone charges nobody until you add one.
                    </span>
                  )}
                </div>

                <select
                  value=""
                  onChange={(e) => addState(index, e.target.value)}
                  disabled={unassigned.length === 0}
                  className="field mt-3 h-9 w-full max-w-xs text-[0.8125rem] sm:w-auto"
                  aria-label={`Add a state to ${zone.name || `zone ${index + 1}`}`}
                >
                  <option value="">
                    {unassigned.length === 0
                      ? "Every state is assigned"
                      : "Add a state…"}
                  </option>
                  {unassigned.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <button onClick={addZone} className="btn btn-secondary w-full">
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add zone
        </button>
      </div>

      {/* Fallback */}
      <div className="mt-4 card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-surface-400" strokeWidth={1.75} />
              <h3 className="font-medium text-surface-900">
                Everywhere else
              </h3>
            </div>
            <p className="mt-1.5 text-sm text-surface-500">
              {unassigned.length === 0
                ? "Every state belongs to a zone, so nothing is charged this rate."
                : `${unassigned.length} ${
                    unassigned.length === 1 ? "state is" : "states are"
                  } charged this rate.`}
            </p>
          </div>

          <div className="w-40">
            <label htmlFor="default-fee" className="label">
              Fee
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-surface-400">
                ₦
              </span>
              <input
                id="default-fee"
                type="number"
                min={0}
                step={1}
                value={defaultFee}
                onChange={(e) => setDefaultFee(Math.max(0, Math.floor(+e.target.value || 0)))}
                className="field pl-7 tabular-nums"
              />
            </div>
          </div>
        </div>

        {unassigned.length > 0 && (
          <p className="mt-4 border-t hairline pt-4 text-[0.8125rem] leading-relaxed text-surface-400">
            {unassigned.join(", ")}
          </p>
        )}
      </div>

      {settings?.updatedAt && (
        <p className="mt-5 text-xs text-surface-400">
          Last changed {formatDate(settings.updatedAt)}
          {settings.updatedBy ? ` by ${settings.updatedBy}` : ""} — currently{" "}
          {zones.length} {zones.length === 1 ? "zone" : "zones"}, fallback{" "}
          {formatPrice(defaultFee)}.
        </p>
      )}
    </div>
  );
};

export default ShippingZonesPanel;
