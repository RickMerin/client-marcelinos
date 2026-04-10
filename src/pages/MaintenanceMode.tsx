import { motion } from "framer-motion";
import { Clock3, Hammer, ShieldCheck } from "lucide-react";

type MaintenanceModeProps = {
  badge: string;
  title: string;
  description: string;
  eta: string;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const MaintenanceMode = ({
  badge,
  title,
  description,
  eta,
}: MaintenanceModeProps) => {
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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <img
            src="/brand-logo.webp"
            alt="Marcelino's Logo"
            className="h-10 w-10 object-contain"
          />
          <div className="ml-1 mt-1 leading-tight">
            <div className="text-[17.5px] -mb-0.75 font-extrabold tracking-widest text-cream font-serif">
              MARCELINO&apos;S
            </div>
            <div className="text-sm text-gold-light tracking-widest font-medium">
              RESORT AND HOTEL
            </div>
          </div>
        </motion.div>

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
              <div className="inline-flex items-center gap-3 text-[13px] tracking-[0.24em] uppercase text-gold-light font-medium">
                <span className="block h-[1.5px] w-9 bg-gold-light" />
                Hilongos, Leyte, Philippines
                <span className="block h-[1.5px] w-9 bg-gold-light" />
              </div>

              <h1 className="mt-5 font-display text-[clamp(38px,6.3vw,70px)] font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-cream">
                {title}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream/85 md:text-lg">
                {description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="btn-primary-mockup inline-flex items-center justify-center tracking-[0.12em]"
                >
                  Reload Page
                </button>
                <a
                  href="https://www.facebook.com/profile.php?id=61557457680496"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost-mockup inline-flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Service Updates
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <motion.div
                className="rounded-2xl border border-cream/20 bg-dark/35 p-4"
                variants={fadeInUp}
                transition={{ delay: 0.18, duration: 0.4 }}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-cream/60">
                  Estimated Return
                </p>
                <p className="mt-2 flex items-center gap-2 text-base font-medium text-cream/90">
                  <Clock3 className="h-4 w-4 text-gold-light" />
                  {eta || "Schedule is being finalized by our operations team"}
                </p>
              </motion.div>

              <motion.div
                className="rounded-2xl border border-cream/20 bg-dark/35 p-4 text-sm text-cream/75"
                variants={fadeInUp}
                transition={{ delay: 0.24, duration: 0.4 }}
              >
                We are currently implementing reliability and performance improvements
                to deliver a more seamless booking experience.
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;

