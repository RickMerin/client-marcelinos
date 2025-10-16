import "../../assets/styles/about.css";
import logo from '../../assets/img/marcelinos-logo.svg'; 
import diamond from '../../assets/img/diamond.svg'; 
import wine from '../../assets/img/wine-toast.svg'; 
import handshake from '../../assets/img/handshake.svg'; 
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function About() {
  return (

    <div>
          <div className="about-container">
      <center id='logo-container'><img src={logo} alt="Marcelino's Logo" className="logo"/></center>

      <div className='txt'>
        <div className="about-heading">
        <span className="green header">ABOUT</span>
        <span className="yellow header">US</span>
      </div>

      <div className="welcome-section left">
        <h2 className="welcome-title yellow">Welcome To Marcelino’s</h2>
        <p className="welcome-text">
          Where elegance meets celebration. Perfect for weddings, parties, and life’s most cherished moments,
          our venue blends timeless beauty with unforgettable experiences.
        </p>
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
      </div>
      </div>
    </div>

    </div>
  );
}

export default About;
