import logo from "../../assets/img/marcelinos-logo.svg";
import diamond from "../../assets/img/diamond.svg";
import wine from "../../assets/img/wine-toast.svg";
import handshake from "../../assets/img/handshake.svg";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

function About() {
  return (
    <div
      id="about"
      className="text-center md:text-left p-10 grid md:grid-cols-[calc(100%-60%)_auto] grid-cols-1 gap-6">
      {/* Logo (left side on desktop, top on mobile) */}
      <div className="flex justify-center items-center w-full">
        <img
          src={logo}
          alt="Marcelino's Logo"
          loading="lazy"
          className="w-3/4 sm:w-2/3 md:w-[70%] lg:w-[60%] h-auto"
        />
      </div>

      {/*  Text and Cards (right side on desktop) */}
      <div className="flex flex-col items-center md:items-start justify-start">
        {/* Heading */}
        <div className="flex gap-2 mb-5 text-3xl sm:text-4xl font-bold justify-center md:justify-start">
          <span className="text-green-800">ABOUT</span>
          <span className="text-yellow-500">US</span>
        </div>

        {/* Welcome Section */}
        <div className="text-center md:text-left">
          <h2 className="text-yellow-500 text-2xl sm:text-3xl mb-2">
            Welcome To Marcelino’s
          </h2>
          <p className="text-[15px] sm:text-[16px] text-neutral-800 leading-relaxed max-w-75 mx-auto md:mx-0">
            Where elegance meets celebration. Perfect for weddings, parties, and
            life’s most cherished moments, our venue blends timeless beauty with
            unforgettable experiences.
          </p>

          {/* Cards Section */}
          <div className="flex flex-wrap justify-center md:justify-start gap-5 mt-8 w-full">
            {/* Card 1 */}
            <Card className="flex-1 min-w-55 max-w-75 text-center bg-neutral-200 text-neutral-900 shadow-md shadow-gray-500/40 rounded-2xl transition-transform hover:scale-105 hover:bg-green-800 hover:text-white">
              <CardHeader>
                <div className="flex justify-center items-center mb-2">
                  <img
                    src={diamond}
                    alt="diamond svg"
                    className="w-10 h-auto"
                  />
                </div>
                <CardTitle className="text-lg font-semibold">
                  Timeless
                  <br />
                  Elegance
                </CardTitle>
                <p className="text-sm mt-2">
                  Marcelino’s Place offers a refined venue where every
                  celebration is crafted with sophistication and lasting beauty.
                </p>
              </CardHeader>
            </Card>

            {/* Card 2 */}
            <Card className="flex-1 min-w-55 max-w-75 text-center bg-neutral-200 text-neutral-900 shadow-md shadow-gray-500/40 rounded-2xl transition-transform hover:scale-105 hover:bg-green-800 hover:text-white">
              <CardHeader>
                <div className="flex justify-center items-center mb-2">
                  <img
                    src={wine}
                    alt="wine toast svg"
                    className="w-10 h-auto"
                  />
                </div>
                <CardTitle className="text-lg font-semibold">
                  Elegant
                  <br />
                  Gatherings
                </CardTitle>
                <p className="text-sm mt-2">
                  A sophisticated venue designed for weddings, parties, and
                  life’s cherished occasions.
                </p>
              </CardHeader>
            </Card>

            {/* Card 3 */}
            <Card className="flex-1 min-w-55 max-w-75 text-center bg-neutral-200 text-neutral-900 shadow-md shadow-gray-500/40 rounded-2xl transition-transform hover:scale-105 hover:bg-green-800 hover:text-white">
              <CardHeader>
                <div className="flex justify-center items-center mb-2">
                  <img
                    src={handshake}
                    alt="handshake svg"
                    className="w-10 h-auto"
                  />
                </div>
                <CardTitle className="text-lg font-semibold">
                  Refined
                  <br />
                  Hospitality
                </CardTitle>
                <p className="text-sm mt-2">
                  We blend elegance with heartfelt service for every
                  celebration.
                </p>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
