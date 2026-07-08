import React from 'react'
// import banner from '../assets/Footer BG.png'
// import logo from '../assets/logo.png'
import Box from '@mui/material/Box';

function Footer() {
  return (
    <Box
      sx={{ backgroundColor: 'background.primary', color: 'text.light' }}
    // style={{ backgroundImage: `url(${banner})` }}
    >
      <footer className="!py-8">
        <div className="container !mx-auto !px-4">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-700 !pb-6">
            {/* <img src={logo} alt="" /> */}
            <h1>LOGO</h1>
            <nav className="flex gap-6 !mt-4 md:!mt-0">
              <a href="#" className="hover:text-gray-400 transition">Home</a>
              <a href="#" className="hover:text-gray-400 transition">About</a>
              <a href="#" className="hover:text-gray-400 transition">Services</a>
              <a href="#" className="hover:text-gray-400 transition">Contact</a>
            </nav>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center !mt-6">
            <p className="text-sm">&copy; 2025 YourBrand. All rights reserved.</p>
            <div className="flex space-x-4 !mt-4 md:!mt-0">
              <a href="#" className="hover:text-gray-400 transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="hover:text-gray-400 transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="hover:text-gray-400 transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="hover:text-gray-400 transition">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </Box>
  )
}

export default Footer;