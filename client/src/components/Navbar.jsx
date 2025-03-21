import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo6 from '../assets/images/logo6.jpg';

const Navbar = () => {
  const location = useLocation();  // Access current location
  const navigate = useNavigate();  // For redirection
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  
  const backgroundClass = location.pathname === '/about' ? 'bg-gradient-to-r from-blue-400 to-purple-300' : 'bg-gradient-to-r from-pink-300 to-[#ffc0cb]';

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from storage
    setIsAuthenticated(false); // Update authentication state
    
  };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token")); // Re-check auth status on mount
  }, [location.pathname]);

  return (
    <header className={`flex items-center justify-between p-4 ${backgroundClass} h-20`}>
      {/* Navigation Links (Left) */}
      <nav className='flex gap-8 font-medium text-lg justify-center w-full'>
        <NavLink
          to='/'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Home
        </NavLink>
        
        <NavLink
          to='/selfassessment'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Self Assessment
        </NavLink>

        <NavLink
          to='/signup'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          ChatBot
        </NavLink>

        <NavLink
          to='/avatarexp'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          3D Avatar
        </NavLink>

        <NavLink
          to='/twotabpage'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Support Center
        </NavLink>

        <NavLink
          to='/tabpage'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Resources
        </NavLink>

        <NavLink
          to='/about'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          About Us
        </NavLink>
      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      )}
      </nav>

      {/* Logo (Center) */}
      <div className='absolute left-15/16 transform -translate-x-1/2 hidden sm:block'>
        <NavLink to='/'>
          <img src={logo6} alt='logo' className='w-28 h-18 object-contain' />
        </NavLink>
      </div>

      {/* Logout Button */}
    </header>
  );
};

export default Navbar;
