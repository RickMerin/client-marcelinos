export interface ModalDesignProps {
  onAccept: () => void;
}

export default function ModalDesign({ onAccept }: ModalDesignProps) {
  return (
    <div className="mx-auto w-full max-w-xl text-center">
      {/* HEADER */}
      <div className="mb-3 text-white md:mb-4">
        <p className="mb-1.5 text-[10px] tracking-[0.24em] uppercase text-[#e6d3a3]">
          Welcome
        </p>
        <h2 className="font-serif text-2xl font-semibold leading-tight md:text-3xl">
          Marcelino&apos;s Resort Hotel
        </h2>
        <p className="mt-1 text-xs tracking-[0.14em] uppercase text-[#e6d3a3]">
          Hilongos, Leyte
        </p>
      </div>

      <p className="mb-3 text-xs text-[#f6f7f5]">
        Thank you for visiting Marcelino&apos;s.
      </p>

      {/* INTRO */}
      <div className="mb-4 flex justify-center text-xs text-[#f6f7f5]/90 md:mb-5">
        <p className="max-w-[620px] rounded-md border border-[#e6d3a3]/20 bg-white/5 px-3 py-2.5 leading-relaxed">
          Please be informed that we currently do not have a swimming pool or
          restaurant, as our resort is new and still improving to serve you
          better.
        </p>
      </div>

      {/* ASSURANCE */}
      <div className="mb-2.5 text-2xl font-semibold text-[#e6d3a3]">
        <h3>What we can assure you:</h3>
      </div>

      <div className="mb-5 text-xs text-[#f6f7f5]/95">
        <div className="mx-auto max-w-[620px] rounded-md border border-[#e6d3a3]/20 bg-white/5 px-3 py-2.5">
          <p>- Clean and well-maintained surroundings -</p>
          <p>- Safe and secure environment -</p>
          <p>- Peaceful and not noisy -</p>
          <p>- Cool, green, and relaxing atmosphere -</p>
        </div>
      </div>

      {/* APPRECIATION MESSAGE */}
      <div className="mb-5 flex justify-center text-xs text-[#f6f7f5]/90">
        <p className="max-w-[620px] leading-relaxed">
          We truly appreciate your understanding and support as we continue to
          grow. Your comfort and relaxation remain our priority.
        </p>
      </div>

      {/* QUOTE / TAGLINE */}
      <div className="mb-5 text-xs italic text-[#e6d3a3]">
        "Marcelino&apos;s - where nature and tranquility meet."
      </div>

      {/* ACCEPT BUTTON */}
      <button
        className="rounded-[4px] bg-[#c6a15b] px-7 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0f1f1a] transition-colors hover:bg-[#e6d3a3]"
        onClick={onAccept}>
        Accept
      </button>
    </div>
  );
}
