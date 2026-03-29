import { usePageSEO } from "@/hooks/usePageSEO";
import { useScrollToTop } from "@/hooks/useScrollToTop";

function RulesRegulation() {
  useScrollToTop();
  usePageSEO({
    title: "Hotel Rules & Regulations | Marcelinos Hotel & Resort",
    description:
      "Official hotel room rules and regulations of Marcelinos Resort Hotel in Hilongos, Leyte.",
    path: "/rules-regulation",
    keywords:
      "hotel rules Marcelinos, resort rules Hilongos Leyte, hotel policies Philippines",
  });

  return (
    <div id="rules-regulation" className="min-h-screen bg-neutral-50">
      <article className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        
        <header className="mb-8 text-left">
          <h1 className="font-display text-3xl font-bold text-green-900 md:text-4xl">
            HOTEL ROOMS RULES AND REGULATIONS
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            Marcelino’s Resort Hotel — Mabini Street, Hilongos, Leyte
          </p>
           <p className="mt-2 text-sm text-neutral-600">
            Last updated: February 2025
          </p>
        </header>

        <div className="space-y-6 text-neutral-800">

          {/* 1 */}
          <section>
            <h2 className="font-semibold text-green-900">1. CHECK-IN / CHECK-OUT</h2>
            <ul className="list-disc pl-6">
              <li>Check-in Time: 12:00 NN</li>
              <li>Check-out time: 10:00 AM</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-semibold text-green-900">2. ROOM CAPACITY</h2>
            <p>
              Maximum room capacity must be strictly complied with. Extra persons are allowed if the room can still accommodate. Additional Charges shall apply. Visitors..
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-semibold text-green-900">3. NO SMOKING POLICY</h2>
            <p>
              Smoking is <strong>STRICTLY PROHIBITED</strong> in all rooms. A penalty will be charged for violation made.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-semibold text-green-900">4. DAMAGE & LOSS</h2>
            <p>
              Guests are responsible for any loss or damage to hotel property. <strong>CHARGES</strong> will apply for damaged or missing items.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-semibold text-green-900">5. CLEANLINESS & HOUSEKEEPING</h2>
            <p>
              Observe Cleanliness at all times. Housekeeping services are available to help you maintain cleanliness in your room.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-semibold text-green-900">6. NOISE POLICY</h2>
            <p>
              Please keep noise levels low, especially from <strong>10:00 PM to 7:00 AM</strong>. Loud music or parties are not allowed in the rooms.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-semibold text-green-900">7. COOKING</h2>
            <p>
              Cooking is strictly <strong>NOT ALLOWED</strong> inside the room.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-semibold text-green-900">8. SAFETY & SECURITY</h2>
            <p>
              Lock your door when leaving the room. The hotel is not responsible for lost valuables.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-semibold text-green-900">9. APPLIANCES & FURNISHINGS</h2>
            <p>
              <strong>DO NOT REMOVE</strong> or rearrange any hotel property. Kindly turn off lights, TV, and air conditioning when not in use.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-semibold text-green-900">10. PROHIBITED ACTIVITIES</h2>
            <p>
              Illegal activities, possession of prohibited substances, gambling, and bringing in weapons are strictly forbidden.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="font-semibold text-green-900">11. PETS</h2>
            <p>Pets are not allowed.</p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="font-semibold text-green-900">12. EMERGENCIES</h2>
            <p>
              In case of emergency, contact the front desk immediately or call the emergency hotline posted on the room.
            </p>
          </section>

          {/* Footer */}
          <section className="text-center pt-6 border-t">
            <p className="italic">
              “We wish you a comfortable & pleasant stay. Should you have any concerns, requests or inquiries, please inform the front desk.”
            </p>
            <p className="mt-2 font-semibold">THE MANAGEMENT</p>
          </section>

        </div>
      </article>
    </div>
  );
}

export default RulesRegulation;