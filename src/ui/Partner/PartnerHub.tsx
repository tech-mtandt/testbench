"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, Check, Handshake, Store, Truck, type LucideIcon } from "lucide-react";
import { useState } from "react";
import PartnerForm, { toSteps } from "./PartnerForm";
import { programKey, type Program, type ProgramType } from "./programs";

const icons: Record<ProgramType, LucideIcon> = { dealer: Store, vendor: Truck, customer: Handshake };

/** Three programs as selectable cards; the chosen one's stepped form shows below (URL: ?type=). */
export default function PartnerHub({ programs, initial }: { programs: Program[]; initial: ProgramType }) {
  const [type, setType] = useState<ProgramType>(initial);
  const current = programs.find((p) => p.type === type) ?? programs[0];

  const select = (t: ProgramType) => {
    setType(t);
    try {
      window.history.replaceState(null, "", `?type=${t}`);
    } catch {}
  };

  return (
    <>
      <div role="radiogroup" aria-label="Partner program" className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        {programs.map((p) => {
          const on = p.type === type;
          const Icon = icons[p.type];
          const steps = toSteps(p.page.sections).length;
          const fields = p.page.sections.reduce((n, s) => n + s.fields.length, 0);
          return (
            <button
              key={p.type}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => select(p.type)}
              className={`group relative flex flex-col rounded-[var(--radius-card)] border p-6 text-left transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease-out-expo)] ${
                on ? "border-ink bg-white shadow-[var(--shadow-lift)]" : "border-line bg-white/60 hover:-translate-y-0.5 hover:border-line-strong hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-500 ${on ? "bg-brand text-ink" : "bg-canvas text-ink"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${on ? "border-ink bg-ink text-white" : "border-line-strong"}`}
                  aria-hidden
                >
                  {on && <Check className="h-3.5 w-3.5" />}
                </span>
              </div>
              <h3 className="mt-6 text-xl">{p.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.pitch}</p>
              <p className="mt-5 font-mono text-[11px] text-subtle">
                {steps} steps · {fields} fields
              </p>
            </button>
          );
        })}
      </div>

      <div id="apply" className="mt-12 scroll-mt-28 sm:mt-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.type}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.6fr)] lg:gap-12"
          >
            <aside className="order-2 min-w-0 lg:order-1 lg:sticky lg:top-32 lg:self-start">
              <p className="eyebrow mb-4">{current.name}</p>
              <h2 className="display-md">{current.page.formTitle}</h2>
              {current.points.length > 0 ? (
                <ul className="mt-6 space-y-4">
                  {current.points.map((pt) => (
                    <li key={pt.title} className="flex gap-3">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{pt.title}</span>
                        {pt.text && <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{pt.text}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-8 flex items-center gap-2 text-[13px] text-muted">
                <ArrowDown className="h-4 w-4" /> Keep PAN, GST and ID documents handy for the final step.
              </p>
            </aside>
            <div className="order-1 min-w-0 lg:order-2">
              <PartnerForm form={programKey[current.type]} title={current.page.formTitle} sections={current.page.sections} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
