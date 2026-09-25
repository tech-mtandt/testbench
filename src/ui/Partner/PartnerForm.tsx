"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, FileUp, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useActionState,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { submitForm, type FormState } from "@/lib/forms";
import type { PartnerField, PartnerSection } from "@/content/partner-forms";

const SPAN: Record<number, string> = {
  3: "sm:col-span-6 lg:col-span-3",
  4: "sm:col-span-6 lg:col-span-4",
  6: "sm:col-span-6",
  12: "sm:col-span-12",
};

type Step = { title: string; groups: PartnerSection[] };

const clean = (t: string | null) => (t ?? "").replace(/\s*\*\s*$/, "").trim();

/** Group the flat legacy sections into steps: level-2 sections and untitled lead-ins join their neighbour. */
export function toSteps(sections: PartnerSection[]): Step[] {
  const steps: Step[] = [];
  let pendingUntitled: PartnerSection[] = [];
  for (const s of sections) {
    if (!s.title) {
      pendingUntitled.push(s);
      continue;
    }
    if (s.level === 2 && steps.length && !pendingUntitled.length) {
      steps[steps.length - 1].groups.push(s);
      continue;
    }
    const merged = pendingUntitled.length > 0;
    steps.push({
      title: merged ? "Company & contact" : clean(s.title),
      groups: [...pendingUntitled, s],
    });
    pendingUntitled = [];
  }
  if (pendingUntitled.length)
    steps.push({ title: "Details", groups: pendingUntitled });
  return steps;
}

const labelCls = "mb-1.5 block text-[13px] font-medium text-ink-2";
const Req = () => <span className="text-brand-600"> *</span>;

function FileField({ f }: { f: PartnerField }) {
  const [name, setName] = useState<string | null>(null);
  return (
    <label className="group flex h-full cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-canvas p-4 transition-colors focus-within:border-ink hover:border-ink">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-line transition-colors group-hover:bg-brand">
        {name ? <Check className="h-4 w-4" /> : <FileUp className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] leading-snug font-medium text-ink">
          {f.label}
          {f.required && <Req />}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-muted">
          {name ?? "PNG, PDF, JPG · max 500 KB"}
        </span>
      </span>
      <input
        type="file"
        name={f.name}
        required={f.required}
        accept={f.accept ?? ".png,.pdf,.jpg,.jpeg"}
        onChange={(e) => setName(e.target.files?.[0]?.name ?? null)}
        className="sr-only"
      />
    </label>
  );
}

function Field({ f, groupTitle }: { f: PartnerField; groupTitle?: string }) {
  if (f.type === "file") return <FileField f={f} />;
  if (f.type === "radio") {
    return (
      <div role="radiogroup" aria-label={f.label}>
        {groupTitle !== f.label && (
          <p className={labelCls}>
            {f.label}
            {f.required && <Req />}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {f.options?.map((o) => (
            <label key={o} className="cursor-pointer">
              <input
                type="radio"
                name={f.name}
                value={o}
                required={f.required}
                className="peer sr-only"
              />
              <span className="inline-flex h-11 items-center rounded-full border border-line bg-white px-4 text-sm text-ink-2 transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand/50 hover:border-ink/40">
                {o}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  }
  const label = (
    <span className={labelCls}>
      {f.label}
      {f.required && <Req />}
    </span>
  );
  if (f.type === "select") {
    return (
      <label className="block">
        {label}
        <select
          name={f.name}
          required={f.required}
          className="field appearance-none"
          defaultValue={f.options?.[0]}
        >
          {f.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
    );
  }
  if (f.type === "textarea") {
    return (
      <label className="block">
        {label}
        <textarea
          name={f.name}
          required={f.required}
          rows={3}
          className="field resize-y"
        />
      </label>
    );
  }
  return (
    <label className="block">
      {label}
      <input
        type={f.type ?? "text"}
        name={f.name}
        required={f.required}
        inputMode={f.type === "number" ? "numeric" : undefined}
        autoComplete={
          f.type === "email" ? "email" : f.type === "tel" ? "tel" : undefined
        }
        className="field"
      />
    </label>
  );
}

const controls = (el: HTMLElement | null) =>
  Array.from(
    el?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input:not([type=hidden]),select,textarea") ?? [],
  );

/**
 * Long partner application as a stepped form: every step stays mounted (so FormData carries all
 * fields), only the current one is visible, and each step validates before moving on.
 */
export default function PartnerForm({
  form,
  title,
  sections,
}: {
  form: string;
  title: string;
  sections: PartnerSection[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    submitForm,
    null,
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const steps = useMemo(() => toSteps(sections), [sections]);
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const top = useRef<HTMLDivElement>(null);
  const allFields = useMemo(
    () => sections.flatMap((s) => s.fields),
    [sections],
  );

  const visible = (f: PartnerField) => {
    if (!f.showIf) return true;
    const sel = allFields.find((x) => x.name === f.showIf!.field);
    return (values[f.showIf.field] ?? sel?.options?.[0]) === f.showIf.value;
  };

  const firstInvalid = (i: number) =>
    controls(refs.current[i]).find((c) => !c.checkValidity());

  const goto = (i: number) => {
    setStep(i);
    setSeen((s) => Math.max(s, i));
    requestAnimationFrame(() => {
      const r = top.current?.getBoundingClientRect();
      if (r && r.top < 80)
        window.scrollTo({
          top: window.scrollY + r.top - 110,
          behavior: "smooth",
        });
    });
  };

  const next = () => {
    const bad = firstInvalid(step);
    if (bad) return bad.reportValidity();
    goto(step + 1);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    for (let i = 0; i < steps.length; i++) {
      const bad = firstInvalid(i);
      if (bad) {
        e.preventDefault();
        if (i !== step) goto(i);
        setTimeout(() => bad.reportValidity(), 60);
        return;
      }
    }
  };

  if (state?.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center rounded-[var(--radius-panel)] border border-line bg-white px-6 py-16 text-center"
      >
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-ink">
          <Check className="h-6 w-6" strokeWidth={2.5} />
        </span>
        <p className="text-lg font-semibold">Application received</p>
        <p className="mt-2 max-w-sm text-sm text-muted">{state.message}</p>
      </motion.div>
    );
  }

  const last = step === steps.length - 1;
  const pct = ((step + 1) / steps.length) * 100;

  return (
    <form
      action={action}
      onSubmit={onSubmit}
      noValidate
      onChange={(e) => {
        const t = e.target as unknown as HTMLSelectElement;
        if (t.tagName === "SELECT")
          setValues((v) => ({ ...v, [t.name]: t.value }));
      }}
      className="overflow-hidden rounded-[var(--radius-panel)] border border-line bg-white"
    >
      <input type="hidden" name="_form" value={form} />
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      {/* Progress */}
      <div ref={top} className="border-b border-line p-5 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl sm:text-2xl">{title}</h2>
          <p className="shrink-0 font-mono text-[12px] text-muted tabular">
            Step {step + 1} / {steps.length}
          </p>
        </div>
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-canvas">
          <motion.div
            className="h-full rounded-full bg-brand"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <ol className="no-scrollbar -mx-5 mt-4 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {steps.map((s, i) => {
            const done = i < step;
            const on = i === step;
            const reachable = i <= seen;
            return (
              <li key={s.title + i} className="shrink-0">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => goto(i)}
                  aria-current={on ? "step" : undefined}
                  className={`flex h-10 items-center gap-2 rounded-full px-3 text-[13px] font-medium transition-colors ${
                    on
                      ? "bg-ink text-white"
                      : reachable
                        ? "text-ink hover:bg-canvas"
                        : "text-subtle"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] ${
                      on
                        ? "bg-brand text-ink"
                        : done
                          ? "bg-ink text-white"
                          : "bg-canvas text-muted"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {s.title}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Steps (all mounted) */}
      <div className="p-5 sm:p-8">
        {steps.map((s, i) => (
          <div
            key={s.title + i}
            ref={(el) => void (refs.current[i] = el)}
            hidden={i !== step}
            className={i === step ? "animate-fade-up" : ""}
          >
            <div className="space-y-8">
              {s.groups.map((g, gi) => {
                const gTitle = clean(g.title);
                const radioOnly =
                  g.fields.length > 0 && g.fields[0]?.type === "radio";
                return (
                  <div
                    key={`${gTitle}-${gi}`}
                    className={
                      gi > 0 && g.level !== 2 ? "border-t border-line pt-8" : ""
                    }
                  >
                    <fieldset>
                      {gTitle && gTitle !== s.title && (
                        <legend
                          className={`mb-4 ${g.level === 2 ? "text-sm font-semibold text-ink" : "font-mono text-[11px] tracking-[0.14em] text-subtle uppercase"}`}
                        >
                          {gTitle}
                          {g.title?.trim().endsWith("*") && <Req />}
                        </legend>
                      )}
                      {g.fields.length > 0 && (
                        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-12">
                          {g.fields.filter(visible).map((f) => (
                            <div
                              key={f.name}
                              className={
                                f.type === "radio"
                                  ? SPAN[12]
                                  : (SPAN[f.span ?? 12] ?? SPAN[12])
                              }
                            >
                              <Field
                                f={f}
                                groupTitle={radioOnly ? gTitle : undefined}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </fieldset>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <AnimatePresence initial={false}>
          {last && (
            <motion.label
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex items-start gap-3 text-[13px] leading-relaxed text-muted"
            >
              <input
                type="checkbox"
                name="marketingOptIn"
                value="yes"
                defaultChecked
                className="mt-0.5 h-4 w-4 accent-ink"
              />
              <span>
                Sign up to receive emails from Mtandt Group about products,
                services, offers, news and events (you can unsubscribe at any
                time). See{" "}
                <Link
                  href="/pages/privacy-policy"
                  className="font-medium text-ink underline decoration-brand decoration-2 underline-offset-4"
                >
                  privacy policy
                </Link>{" "}
                for more details.
              </span>
            </motion.label>
          )}
        </AnimatePresence>
        {state && !state.ok && (
          <p className="mt-4 text-sm text-red-600">{state.message}</p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={() => goto(step - 1)}
            disabled={step === 0}
            className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm font-medium text-ink transition-colors hover:bg-canvas disabled:invisible"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {last ? (
            <button
              type="submit"
              disabled={pending}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-sm font-medium text-ink transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Sending…" : "Submit application"}
              {!pending && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-sm font-medium text-white transition-colors hover:bg-ink-2"
            >
              Continue
              <span className="-ml-1 hidden sm:inline">
                to {steps[step + 1]?.title.toLowerCase()}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
