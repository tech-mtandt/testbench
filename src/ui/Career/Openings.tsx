"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Briefcase, Clock, MapPin, Plus } from "lucide-react";
import { useLenis } from "lenis/react";
import { useMemo, useState } from "react";
import Chip from "@/ui/kit/Chip";
import { APPLY_EVENT, type ApplyDetail } from "./CareerForm";

export type Opening = { id: string; title: string; html: string; department: string; location: string | null; experience: string | null };

/** Open roles as expandable rows with a department filter; "Apply" pre-fills and scrolls to the form. */
export default function Openings({ jobs, formId = "interest-form" }: { jobs: Opening[]; formId?: string }) {
  const lenis = useLenis();
  const [open, setOpen] = useState<string | null>(null);
  const [dept, setDept] = useState<string | null>(null);
  const depts = useMemo(() => Array.from(new Set(jobs.map((j) => j.department))), [jobs]);
  const list = dept ? jobs.filter((j) => j.department === dept) : jobs;

  const apply = (j: Opening) => {
    window.dispatchEvent(new CustomEvent<ApplyDetail>(APPLY_EVENT, { detail: { post: j.title, department: j.department } }));
    const el = document.getElementById(formId);
    if (el) {
      if (lenis) lenis.scrollTo(el, { offset: -100, duration: 1.1 });
      else el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => document.getElementById("post_applied_for")?.focus({ preventScroll: true }), 900);
  };

  return (
    <div>
      {depts.length > 1 && (
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Chip active={!dept} onClick={() => setDept(null)} count={jobs.length}>
            All roles
          </Chip>
          {depts.map((d) => (
            <Chip key={d} active={dept === d} onClick={() => setDept(d)} count={jobs.filter((j) => j.department === d).length}>
              {d}
            </Chip>
          ))}
        </div>
      )}

      <div className="hidden grid-cols-[minmax(0,1.6fr)_1fr_1fr_120px_40px] gap-4 border-b border-line px-5 pb-3 font-mono text-[11px] tracking-[0.12em] text-subtle uppercase md:grid">
        <span>Role</span>
        <span>Department</span>
        <span>Location</span>
        <span>Experience</span>
        <span />
      </div>
      <ul className="divide-y divide-line border-b border-line">
        {list.map((j) => {
          const on = open === j.id;
          return (
            <li key={j.id} className={`transition-colors duration-500 ${on ? "bg-white" : "hover:bg-white/60"}`}>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`job-${j.id}`}
                onClick={() => setOpen(on ? null : j.id)}
                className="grid w-full grid-cols-[minmax(0,1fr)_40px] items-center gap-4 px-4 py-5 text-left sm:px-5 md:grid-cols-[minmax(0,1.6fr)_1fr_1fr_120px_40px]"
              >
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-ink sm:text-lg">{j.title}</span>
                  <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted md:hidden">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> {j.department}
                    </span>
                    {j.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {j.location}
                      </span>
                    )}
                    {j.experience && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {j.experience}
                      </span>
                    )}
                  </span>
                </span>
                <span className="hidden text-sm text-ink-2 md:block">{j.department}</span>
                <span className="hidden text-sm text-ink-2 md:block">{j.location ?? "—"}</span>
                <span className="hidden font-mono text-sm text-ink-2 tabular md:block">{j.experience ?? "—"}</span>
                <span
                  className={`flex h-9 w-9 items-center justify-center justify-self-end rounded-full transition-all duration-500 ease-[var(--ease-out-expo)] ${
                    on ? "rotate-45 bg-brand text-ink" : "bg-ink/5 text-ink"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    id={`job-${j.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-8 px-4 pb-8 sm:px-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                      <div
                        className="prose-mt max-w-3xl text-[14.5px] [&_p:has(>b:only-child)]:mt-6 [&_p:has(>b:only-child)]:mb-2 [&>br]:hidden"
                        dangerouslySetInnerHTML={{ __html: j.html }}
                      />
                      <div className="lg:sticky lg:top-40 lg:self-start">
                        <div className="rounded-[var(--radius-card)] bg-canvas p-5">
                          <p className="text-sm font-semibold">Interested?</p>
                          <p className="mt-1 text-[13px] text-muted">We&apos;ll pre-fill the application form for this role.</p>
                          <button
                            type="button"
                            onClick={() => apply(j)}
                            className="group mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-medium text-ink transition-colors hover:bg-brand-600"
                          >
                            Apply for this role
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
