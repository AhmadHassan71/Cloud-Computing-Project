import React from "react";
import { useNavigate, Link } from "react-router-dom";
import './Home.css';

// Import shared components
import Button from './shared/Button';
import Card from './shared/Card';

// Import images
import Logo from '../images/Logo.png';
import AboutPKReco1 from '../images/a1.png';
import AboutPKReco2 from '../images/a2.png';
import AboutUSImage from '../images/aboutUsImage.png';
import Mail from '../images/mail.png';
import Phone from '../images/phone.png';
import Feedback from '../images/feedback.png';
import LandingImage from '../images/LandingImage.png';

const Home = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate('/allItems');
  };

  const handleCreateOrder = () => {
    navigate('/ordercreate');
  };

  // Statistics for the cafe (these would ideally come from the backend in a real scenario)
  const stats = [
    { value: '18+', label: 'Coffee Varieties' },
    { value: '24+', label: 'Pastry Options' },
    { value: '12+', label: 'Dessert Choices' },
    { value: '1.2k+', label: 'Daily Customers' }
  ];

  // Featured menu items (these would ideally come from the backend in a real scenario)
  const featuredItems = [
    { name: 'Signature Espresso', price: '$3.50', category: 'Coffee', image: AboutUSImage },
    { name: 'Chocolate Croissant', price: '$4.25', category: 'Pastry', image: AboutUSImage },
    { name: 'Caramel Latte', price: '$4.75', category: 'Coffee', image: AboutUSImage }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <img src={Logo} alt="Espresso Elegance Logo" className="hero-logo" />
            <h1>Elegance in Every Espresso</h1>
            <p>Where Every Sip is a Symphony of Flavor</p>
            <div className="hero-buttons">
              <Button variant="primary" size="large" onClick={handleExplore}>
                Explore Menu
              </Button>
              <Button variant="outlined" size="large" onClick={handleCreateOrder}>
                Create Order
              </Button>
            </div>
          </div>
          <div className="hero-image-container">
            <img src={LandingImage} alt="Coffee Shop" className="hero-image" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div className="stat-item" key={index}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Menu Items</h2>
          <p>Explore our most popular selections</p>
        </div>
        
        <div className="featured-items">
          {featuredItems.map((item, index) => (
            <Card className="featured-item-card" key={index}>
              <div className="featured-item-image">
                <img src={item.image} alt={item.name} />
                <div className="featured-item-badge">{item.category}</div>
              </div>
              <div className="featured-item-info">
                <h3>{item.name}</h3>
                <p className="featured-item-price">{item.price}</p>
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => navigate('/allItems')}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="view-all-container">
          <Link to="/allItems">
            <Button variant="outlined">View All Menu Items</Button>
          </Link>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section">
        <div className="about-content">
          <div className="about-image">
            <img src={AboutUSImage} alt="About Espresso Elegance" />
          </div>
          
          <div className="about-text">
            <div className="about-header">
              <img src={AboutPKReco1} alt="" className="about-deco" />
              <h2>About Us</h2>
              <img src={AboutPKReco2} alt="" className="about-deco" />
            </div>
            
            <p className="about-tagline">
              Welcome to Espresso Elegance, where the classy appeal of Marine Drive, Colombo, 
              combines with the enchanting aroma of freshly made coffee and pastries.
            </p>
            
            <p className="about-description">
              Since 2023, under Thilan's guidance, we've dedicated ourselves to providing a haven 
              where coffee aficionados and pastry lovers alike can indulge in the finest offerings.
              <br /><br />
              With a commitment to freshness and quality ingrained in our ethos, every cup of coffee 
              and each pastry served reflects our passion for excellence.
            </p>
            
            <Button 
              variant="secondary" 
              onClick={() => document.querySelector('.contact-section').scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="section-header">
          <h2>Get in Touch</h2>
          <p>We'd love to hear from you</p>
        </div>
        
        <div className="contact-cards">
          <Card className="contact-card">
            <img src={Mail} alt="Email" className="contact-icon" />
            <h3>Email Us</h3>
            <p>cafeespressoelegance@gmail.com</p>
            <a href="mailto:cafeespressoelegance@gmail.com">
              <Button variant="outlined" size="small">Send Email</Button>
            </a>
          </Card>
          
          <Card className="contact-card">
            <img src={Phone} alt="Phone" className="contact-icon" />
            <h3>Call Us</h3>
            <p>+94 112 456 789</p>
            <a href="tel:+94112456789">
              <Button variant="outlined" size="small">Call Now</Button>
            </a>
          </Card>
          
          <Card className="contact-card">
            <img src={Feedback} alt="Feedback" className="contact-icon" />
            <h3>Provide Feedback</h3>
            <p>Help us improve our service</p>
            <Link to="/feedback">
              <Button variant="outlined" size="small">Give Feedback</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Action Section */}
      <section className="action-section">
        <div className="action-content">
          <h2>Ready to manage your coffee shop?</h2>
          <p>Explore all the management features available to you</p>
          <div className="action-buttons">
            <Button variant="primary" onClick={() => navigate('/allItems')}>
              Manage Menu
            </Button>
            <Button variant="secondary" onClick={() => navigate('/allorders')}>
              View Orders
            </Button>
            <Button variant="outlined" onClick={() => navigate('/downloadInvoice')}>
              Generate Reports
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
