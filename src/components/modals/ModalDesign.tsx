export interface ModalDesignProps {
  onAccept: () => void;
}

export default function ModalDesign({ onAccept }: ModalDesignProps) {
  return (
    <>
      {/* HEADER */}
      <div className="text-xl font-bold mt-3 mb-3 md:mb-5 text-white">
        <h2>Welcome to Marcelino's </h2>
        <h2>Resort and Hotel</h2>
        <h2>Hilongos, Leyte</h2>
      </div>

      <p className="text-white text-xs">Thank you for visiting Marcelino's!</p>

      {/* INTRO */}
      <div className="text-xs mb-4 flex justify-center md:mb-8 text-white">
        <p className="max-w-[80vw]">
          Please be informed that we currently do not have a swimming pool or
          restaurant, as our resort is new and still improving to serve you
          better.
        </p>
      </div>

      {/* ASSURANCE */}
      <div className="text-xl font-semibold mb-3 text-white">
        <h3>What we can assure you:</h3>
      </div>

      <div className="text-xs mb-6 text-white">
        <p>- Clean and well-maintained surroundings -</p>
        <p>- Safe and secure environment -</p>
        <p>- Peaceful and not noisy -</p>
        <p>- Cool, green, and relaxing atmosphere -</p>
      </div>

      {/* APPRECIATION MESSAGE */}
      <div className="text-xs mb-6 flex justify-center text-white">
        <p className="max-w-[80vw]">
          We truly appreciate your understanding and support as we continue to
          grow. Your comfort and relaxation remain our priority.
        </p>
      </div>

      {/* QUOTE / TAGLINE */}
      <div className="text-sm mb-6 yellow italic">
        “Marcelino’s — where nature and tranquility meet.”
      </div>

      {/* ACCEPT BUTTON */}
      <button
        className="rounded bg-yellow-600 px-6 py-2 text-white hover:bg-yellow-800 transition"
        onClick={onAccept}>
        Accept
      </button>
    </>
  );
}
