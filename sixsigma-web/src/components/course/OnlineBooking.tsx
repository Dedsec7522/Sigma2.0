"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { buttonClass } from "@/components/ui/button";

const fmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

/**
 * Mirrors the legacy booking form exactly (GET /booking/online/{id}?addon[]=…), so
 * checkout on the existing platform keeps working, with or without JavaScript.
 */
export function OnlineBooking({ action, price, addons, showPrices }: { action: string; price: number | null; addons: { id: string; label: string; price: number }[]; showPrices: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);
  const total = (price ?? 0) + addons.filter((a) => selected.includes(a.id)).reduce((s, a) => s + a.price, 0);
  return (
    <form action={action} method="get" className="rounded-2xl bg-white p-6 text-ink shadow-pop">
      {showPrices && price ? (
        <p className="text-sm text-ink-muted">
          Course price
          <span className="block font-display text-3xl font-semibold tabular-nums text-navy-900">{fmt.format(price)}</span>
        </p>
      ) : (
        <p className="font-display text-xl font-semibold text-navy-900">Self-paced online course</p>
      )}
      {addons.length > 0 && (
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-navy-900">Optional extras</legend>
          <ul className="mt-2 space-y-2">
            {addons.map((a) => (
              <li key={a.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3 py-2.5 text-[0.95rem] transition-colors hover:border-navy-600 has-[:checked]:border-navy-900 has-[:checked]:bg-navy-50">
                  <input
                    type="checkbox"
                    name="addon[]"
                    value={a.id}
                    checked={selected.includes(a.id)}
                    onChange={(e) => setSelected((s) => (e.target.checked ? [...s, a.id] : s.filter((x) => x !== a.id)))}
                    className="mt-0.5 size-5 shrink-0 accent-navy-900"
                  />
                  <span className="flex-1">{a.label}</span>
                  {showPrices && <span className="font-semibold tabular-nums text-navy-900">+{fmt.format(a.price)}</span>}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}
      {showPrices && price ? (
        <p className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
          <span className="font-semibold text-navy-900">Total</span>
          <motion.span key={total} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl font-semibold tabular-nums text-navy-900" aria-live="polite">
            {fmt.format(total)}
          </motion.span>
        </p>
      ) : null}
      <button type="submit" className={buttonClass("gold", "md", "mt-5 w-full")}>
        Buy now
      </button>
      <p className="mt-3 text-center text-xs text-ink-subtle">Secure checkout. Start learning straight away.</p>
    </form>
  );
}
