import "../../assets/styles/about.css";
import diamond from '../../assets/img/diamond.svg'; 
import wine from '../../assets/img/wine-toast.svg'; 
import handshake from '../../assets/img/handshake.svg'; 
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function CardsSection() {
  return (
    <div className="cards">
      <Card className="flex-1 card-item text-center bg-neutral-200 c-text-color shadow-md shadow-gray-500/40 rounded-2xl transition-transform transform hover:scale-105">
        <CardHeader>
                    <div className="card-icon">
        <img src={diamond} alt="diamond svg"/>   
        </div>       
        <CardTitle className="text-lg-w">Timeless<br/>Elegance</CardTitle>
        <p>Marcelino’s Place offers a refined venue where every celebration is
            crafted with sophistication and lasting beauty.
        </p>
      
        </CardHeader>
      </Card>

      <Card className="flex-1 card-item text-center bg-neutral-200 c-text-color shadow-md shadow-gray-500/40 rounded-2xl transition-transform transform hover:scale-105">
        <CardHeader>
          <div className="card-icon">
          <img src={wine} alt="wine toast svg"/>  
          </div>        
          <CardTitle className="">Elegant<br></br>Gatherings</CardTitle>
            <p>
              A sophisticated venue designed for weddings, parties, and life’s
            cherished occasions.
            </p>
        
        </CardHeader>
      </Card>

      <Card className="flex-1 card-item bg-neutral-200 text-center shadow-md shadow-gray-500/40 rounded-2xl transition-transform transform hover:scale-105">
        <CardHeader>
        <div className="card-icon">
          <img src={handshake} alt="handshake svg"/>
        </div>
                  
        <CardTitle className="text-lg-w font-">Refined<br/>Hospitality</CardTitle><p>
          We blend elegance with heartfelt service for every celebration.
        </p>
          
        </CardHeader>
      </Card>
    </div>
  );
}

export default CardsSection;
