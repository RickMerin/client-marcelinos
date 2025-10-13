import logo from '../assets/img/marcelinos-logo.svg'; 
import CardsSection from '@/components/cards/AboutUsCards';

function About() {
  return (
    <div className="about-container">
      <center id='logo-container'><img src={logo} alt="Marcelino's Logo" className="logo"/></center>

      <div className='txt'>
        <div className="about-heading">
        <span className="green">ABOUT</span>
        <span className="yellow">US</span>
      </div>

      <div className="welcome-section left">
        <h2 className="welcome-title yellow">Welcome To Marcelino’s</h2>
        <p className="welcome-text">
          Where elegance meets celebration. Perfect for weddings, parties, and life’s most cherished moments,
          our venue blends timeless beauty with unforgettable experiences.
        </p>
      </div>
      <><CardsSection /></>
      </div>
      
    </div>
  );
}



export default About;

