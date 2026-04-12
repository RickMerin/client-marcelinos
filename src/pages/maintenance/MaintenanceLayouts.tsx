import type { ReactElement } from "react";
import { motion } from "framer-motion";
import {
  Clock3,
  Hammer,
  Palmtree,
  ShieldCheck,
  Sparkles,
  Terminal,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type MaintenanceContentProps,
  type MaintenanceUiVariant,
  normalizeMaintenanceUiVariant,
} from "./maintenanceUi";

const FB_UPDATES =
  "https://www.facebook.com/profile.php?id=61557457680496";

const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

function LogoLockup({ className }: { className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: 0.45 }}
      className={cn("flex items-center gap-2", className)}
    >
      <img
        src="/brand-logo.webp"
        alt="Marcelino's Logo"
        className="h-10 w-10 object-contain"
      />
      <div className="ml-1 mt-1 leading-tight">
        <div className="-mb-0.75 font-serif text-[17.5px] font-extrabold tracking-widest text-cream">
          MARCELINO&apos;S
        </div>
        <div className="text-sm font-medium tracking-widest text-gold-light">
          RESORT AND HOTEL
        </div>
      </div>
    </motion.div>
  );
}

function ActionsRow({
  primaryExtra,
  secondaryExtra,
}: {
  primaryExtra?: string;
  secondaryExtra?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => window.location.reload()}
        className={cn(
          "btn-primary-mockup inline-flex items-center justify-center tracking-[0.12em]",
          primaryExtra,
        )}
      >
        Reload Page
      </button>
      <a
        href={FB_UPDATES}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "btn-ghost-mockup inline-flex items-center gap-2",
          secondaryExtra,
        )}
      >
        <ShieldCheck className="h-4 w-4" />
        Service Updates
      </a>
    </div>
  );
}

function EtaLine({
  eta,
  iconClass,
  labelClass,
  valueClass,
}: {
  eta: string;
  iconClass?: string;
  labelClass?: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className={cn("text-xs uppercase tracking-[0.16em]", labelClass)}>
        Estimated return
      </p>
      <p className={cn("mt-2 flex items-center gap-2 text-base font-medium", valueClass)}>
        <Clock3 className={cn("h-4 w-4 shrink-0", iconClass)} />
        {eta || "Schedule is being finalized by our operations team"}
      </p>
    </div>
  );
}

function ResortHero({ badge, title, description, eta }: MaintenanceContentProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-dark text-cream">
      <img
        src="/img/banner2.jpg"
        alt="Marcelino's Resort"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-dark/90 via-dark/70 to-dark/35" />
      <motion.div
        aria-hidden
        className="absolute -left-12 top-24 h-60 w-60 rounded-full bg-gold/20 blur-3xl"
        animate={{ x: [0, 24, 0], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 py-8 lg:px-16 xl:px-20">
        <LogoLockup />

        <div className="flex flex-1 items-center">
          <motion.div
            className="w-full rounded-3xl border border-cream/20 bg-dark/45 p-6 shadow-[0_22px_65px_-25px_rgba(0,0,0,0.7)] backdrop-blur-md md:p-10"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.45 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-gold-light/55 bg-gold/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-light"
              variants={fadeInUp}
              transition={{ delay: 0.05, duration: 0.4 }}
            >
              <Hammer className="h-3.5 w-3.5" />
              {badge}
            </motion.div>

            <motion.div
              className="mt-6 grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]"
              variants={fadeInUp}
              transition={{ delay: 0.1, duration: 0.45 }}
            >
              <div>
                <div className="inline-flex items-center gap-3 text-[13px] font-medium uppercase tracking-[0.24em] text-gold-light">
                  <span className="block h-[1.5px] w-9 bg-gold-light" />
                  Hilongos, Leyte, Philippines
                  <span className="block h-[1.5px] w-9 bg-gold-light" />
                </div>

                <h1 className="mt-5 font-display text-fluid-h1 font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-cream">
                  {title}
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream/85 md:text-lg">
                  {description}
                </p>

                <div className="mt-7">
                  <ActionsRow />
                </div>
              </div>

              <div className="space-y-4">
                <motion.div
                  className="rounded-2xl border border-cream/20 bg-dark/35 p-4"
                  variants={fadeInUp}
                  transition={{ delay: 0.18, duration: 0.4 }}
                >
                  <EtaLine
                    eta={eta}
                    iconClass="text-gold-light"
                    labelClass="text-cream/60"
                    valueClass="text-cream/90"
                  />
                </motion.div>

                <motion.div
                  className="rounded-2xl border border-cream/20 bg-dark/35 p-4 text-sm text-cream/75"
                  variants={fadeInUp}
                  transition={{ delay: 0.24, duration: 0.4 }}
                >
                  We are currently implementing reliability and performance
                  improvements to deliver a more seamless booking experience.
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MinimalDawn({ badge, title, description, eta }: MaintenanceContentProps) {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-cream text-stone-800"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgb(214 211 209 / 0.35) 1px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/80 via-cream/40 to-gold-light/15" />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-500">
            {badge}
          </p>
          <h1 className="mt-8 font-display text-4xl font-semibold leading-tight tracking-tight text-stone-900 md:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            {description}
          </p>
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-stone-200/80 bg-white/70 px-6 py-5 text-left shadow-sm backdrop-blur-sm">
            <EtaLine
              eta={eta}
              iconClass="text-gold"
              labelClass="text-stone-500"
              valueClass="text-stone-800"
            />
          </div>
          <div className="mt-10 flex justify-center">
            <ActionsRow />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MidnightTech({ badge, title, description, eta }: MaintenanceContentProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(148 163 184 / 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-56 w-56 rounded-full bg-indigo-600/25 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12 lg:px-10">
        <div className="flex items-center gap-2 text-cyan-300/90">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            {badge}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-12 flex flex-1 flex-col justify-center"
        >
          <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            {description}
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div className="rounded-2xl border border-cyan-500/25 bg-slate-900/60 p-5 backdrop-blur-md">
              <EtaLine
                eta={eta}
                iconClass="text-cyan-400"
                labelClass="text-slate-500"
                valueClass="text-slate-100"
              />
            </div>
            <ActionsRow primaryExtra="shadow-[0_0_24px_-4px_rgba(34,211,238,0.45)]" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SunsetWarm({ badge, title, description, eta }: MaintenanceContentProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-amber-600 text-white">
      <div className="absolute inset-0 bg-linear-to-br from-amber-500 via-rose-500 to-violet-900 opacity-95" />
      <div className="absolute inset-0 mix-blend-overlay bg-[url('/img/banner2.jpg')] bg-cover bg-center opacity-25" />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/90">
            {badge}
          </span>
          <h1 className="mt-8 font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
            {description}
          </p>
          <p className="mt-8 text-sm font-medium text-white/85">
            <Clock3 className="mr-2 inline-block h-4 w-4 align-text-bottom" />
            {eta || "We will post a return time as soon as it is confirmed."}
          </p>
          <div className="mt-10 flex justify-center">
            <ActionsRow />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SplitShowcase({ badge, title, description, eta }: MaintenanceContentProps) {
  return (
    <div className="flex min-h-screen flex-col bg-cream lg:flex-row">
      <div className="relative h-56 shrink-0 lg:h-auto lg:w-[46%]">
        <img
          src="/img/banner2.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-dark/80 via-dark/20 to-transparent lg:bg-linear-to-r" />
        <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10">
          <LogoLockup />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            {badge}
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold text-stone-900 md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
            {description}
          </p>
          <div className="mt-8 max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <EtaLine
              eta={eta}
              iconClass="text-gold"
              labelClass="text-stone-500"
              valueClass="text-stone-800"
            />
          </div>
          <div className="mt-8">
            <ActionsRow />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FloatingCard({ badge, title, description, eta }: MaintenanceContentProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-900">
      <img
        src="/img/banner2.jpg"
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl brightness-50"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative mx-auto flex min-h-screen items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl rounded-[2rem] border border-white/15 bg-dark/75 p-8 shadow-[0_30px_80px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl md:p-12"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-light">
            {badge}
          </p>
          <h1 className="mt-5 font-display text-3xl font-semibold text-cream md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-cream/85">{description}</p>
          <div className="mt-8 border-t border-cream/15 pt-6">
            <EtaLine
              eta={eta}
              iconClass="text-gold-light"
              labelClass="text-cream/55"
              valueClass="text-cream"
            />
          </div>
          <div className="mt-8">
            <ActionsRow />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ConsoleStatus({ badge, title, description, eta }: MaintenanceContentProps) {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 font-mono text-sm text-emerald-400 md:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 border-b border-emerald-500/30 pb-3 text-emerald-500/80">
          <Terminal className="h-4 w-4" />
          <span>marcelinos-maintenance — session active</span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-6 space-y-4"
        >
          <p>
            <span className="text-emerald-600">$</span> status --service=public-site
          </p>
          <p className="text-emerald-300/90">
            [{badge}] {title}
          </p>
          <p className="leading-relaxed text-emerald-200/85">{description}</p>
          <p>
            <span className="text-zinc-500">eta:</span>{" "}
            <span className="text-amber-300/95">
              {eta || "pending scheduling"}
            </span>
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-emerald-300 transition hover:bg-emerald-500/20"
            >
              reload
            </button>
            <a
              href={FB_UPDATES}
              target="_blank"
              rel="noreferrer"
              className="ml-3 rounded border border-zinc-600 px-4 py-2 text-zinc-300 transition hover:border-emerald-500/40 hover:text-emerald-200"
            >
              updates →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CoastalBreeze({ badge, title, description, eta }: MaintenanceContentProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-teal-950 text-cream">
      <div className="absolute inset-0 bg-linear-to-b from-teal-800/90 via-cyan-900/80 to-slate-950" />
      <Waves
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 text-cyan-300/25 md:h-48"
        strokeWidth={1}
      />
      <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-14">
        <div className="flex items-center gap-2 text-cyan-100/90">
          <Palmtree className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.22em]">
            {badge}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 flex flex-1 flex-col justify-center"
        >
          <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/85">
            {description}
          </p>
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="rounded-2xl border border-cyan-300/25 bg-teal-950/50 px-5 py-4 backdrop-blur-sm">
              <EtaLine
                eta={eta}
                iconClass="text-cyan-200"
                labelClass="text-cream/55"
                valueClass="text-cream"
              />
            </div>
            <ActionsRow />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function EditorialSerif({ badge, title, description, eta }: MaintenanceContentProps) {
  return (
    <div className="min-h-screen bg-white text-stone-900">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.45em] text-stone-400">
            {badge}
          </p>
          <div className="mx-auto mt-10 h-px max-w-xs bg-stone-300" />
          <h1 className="mt-12 text-center font-display text-5xl font-normal leading-[1.08] tracking-tight md:text-6xl">
            {title}
          </h1>
          <div className="mx-auto mt-10 h-px max-w-xs bg-stone-300" />
          <p className="mx-auto mt-12 max-w-xl text-center text-lg leading-[1.75] text-stone-600">
            {description}
          </p>
          <p className="mt-14 text-center text-sm italic text-stone-500">
            <Clock3 className="mr-2 inline-block h-4 w-4 align-text-bottom text-gold" />
            {eta || "Return time will be announced shortly."}
          </p>
          <div className="mt-12 flex justify-center">
            <ActionsRow />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function NeonNight({ badge, title, description, eta }: MaintenanceContentProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 right-0 h-80 w-80 rounded-full bg-violet-600/25 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-fuchsia-500/25 bg-zinc-900/50 p-8 shadow-[0_0_60px_-20px_rgba(192,38,211,0.45)] backdrop-blur-md md:p-12"
        >
          <span className="inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-fuchsia-200">
            {badge}
          </span>
          <h1 className="mt-8 font-display text-4xl font-semibold md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
            {description}
          </p>
          <div className="mt-10 flex flex-col gap-8 border-t border-fuchsia-500/20 pt-8 md:flex-row md:items-center md:justify-between">
            <EtaLine
              eta={eta}
              iconClass="text-fuchsia-300"
              labelClass="text-zinc-500"
              valueClass="text-zinc-100"
            />
            <ActionsRow />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const VARIANTS: Record<
  MaintenanceUiVariant,
  (props: MaintenanceContentProps) => ReactElement
> = {
  "resort-hero": ResortHero,
  "minimal-dawn": MinimalDawn,
  "midnight-tech": MidnightTech,
  "sunset-warm": SunsetWarm,
  "split-showcase": SplitShowcase,
  "floating-card": FloatingCard,
  "console-status": ConsoleStatus,
  "coastal-breeze": CoastalBreeze,
  "editorial-serif": EditorialSerif,
  "neon-night": NeonNight,
};

export function MaintenanceLayoutView({
  variant,
  ...content
}: MaintenanceContentProps & { variant: string }) {
  const key = normalizeMaintenanceUiVariant(variant);
  const Component = VARIANTS[key];
  return <Component {...content} />;
}
