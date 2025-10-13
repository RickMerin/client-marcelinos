import "../../assets/styles/about.css";
import diamond from '../../assets/img/diamond.svg'; 
import wine from '../../assets/img/wine-toast.svg'; 
import handshake from '../../assets/img/handshake.svg'; 
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function CardsSection() {
  return (
    <div className="cards">
      <Card className="flex-1 text-center bg-neutral-200 c-text-color shadow-md shadow-gray-500/40 rounded-2xl transition-transform transform hover:scale-105">
        <CardHeader>
        <img src={diamond} alt="diamond svg" className="card-icon "/>          
        <CardTitle className="text-lg-w">Timeless<br/>Elegance</CardTitle>
          <CardDescription className='desc c-text-color'>
            Marcelino’s Place offers a refined venue where every celebration is
            crafted with sophistication and lasting beauty.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="flex-1 text-center shadow-md shadow-gray-500/40 bg-green text-white rounded-2xl transition-transform transform hover:scale-105">
        <CardHeader>
          <img src={wine} alt="wine toast svg" className="card-icon"/>          
          <CardTitle className="">Elegant<br></br>Gatherings</CardTitle>
          <CardDescription className="text-white text-sm desc">
            A sophisticated venue designed for weddings, parties, and life’s
            cherished occasions.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="flex-1 bg-neutral-200 text-center shadow-md shadow-gray-500/40 rounded-2xl transition-transform transform hover:scale-105">
        <CardHeader>
        <img src={handshake} alt="handshake svg" className="card-icon"/>          
        <CardTitle className="text-lg-w font-">Refined<br/>Hospitality</CardTitle>
          <CardDescription className='desc c-text-color'>
            We blend elegance with heartfelt service for every celebration.
          </CardDescription>  
        </CardHeader>
      </Card>
    </div>
  );
}

export default CardsSection;
