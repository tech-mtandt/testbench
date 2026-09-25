import {
  Award,
  BadgeCheck,
  BookOpen,
  ClipboardCheck,
  Clock,
  Construction,
  Flame,
  Gauge,
  GraduationCap,
  Hammer,
  Hand,
  HardHat,
  HeartPulse,
  MonitorPlay,
  PackageCheck,
  Presentation,
  SatelliteDish,
  ShieldCheck,
  Target,
  Timer,
  TrendingUp,
  TriangleAlert,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { FamilySlug } from "./model";

export const familyIcon: Record<FamilySlug, LucideIcon> = { cesl: GraduationCap, equipr: Wrench, eat: HardHat };

const featureRules: [RegExp, LucideIcon][] = [
  [/clock|on-time|downtime|timer/i, Timer],
  [/laptop|blended|learning|classroom/i, MonitorPlay],
  [/group|users|employees|team|manpower/i, Users],
  [/risk|hazard/i, TriangleAlert],
  [/first aid|medical/i, HeartPulse],
  [/fire/i, Flame],
  [/manual handling|handling/i, Hand],
  [/work at height/i, Construction],
  [/access method|access equipment|scaffold/i, Construction],
  [/safety|safe/i, ShieldCheck],
  [/efficien|productiv/i, TrendingUp],
  [/monitor|telematic|remote/i, SatelliteDish],
  [/inspection|pre-|check/i, ClipboardCheck],
  [/commission/i, PackageCheck],
  [/refurb|repair/i, Hammer],
  [/breakdown|maintenance|amc/i, Wrench],
  [/deliver|hire|transport/i, Truck],
  [/performance|gauge/i, Gauge],
];

/** Pick a lucide icon from the feature title / legacy Font Awesome class. */
export function featureIcon(...hints: (string | null | undefined)[]): LucideIcon {
  const text = hints.filter(Boolean).join(" ");
  return featureRules.find(([re]) => re.test(text))?.[1] ?? BadgeCheck;
}

const factRules: [RegExp, LucideIcon][] = [
  [/duration/i, Clock],
  [/batch/i, Users],
  [/certif/i, Award],
  [/format/i, Presentation],
  [/target/i, Target],
  [/prereq/i, ClipboardCheck],
  [/material/i, BookOpen],
];

export const factIcon = (label: string): LucideIcon => factRules.find(([re]) => re.test(label))?.[1] ?? BadgeCheck;
