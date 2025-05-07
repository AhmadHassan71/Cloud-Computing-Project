import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

const Layout = ({ children, setIsAuthenticated }) => {
  return (
    <div className="app-layout">
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <main className="app-content">
        <div className="app-container">
          {children}
        </div>
      </main>
      <footer className="app-footer">
        <div className="app-container">
          <p>© {new Date().getFullYear()} Espresso Elegance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;