import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo6 from '../assets/images/logo6.jpg';
import axios from 'axios'; // Make sure axios is installed

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [userProfile, setUserProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const backgroundClass = 'bg-gradient-to-r from-pink-300 to-[#ffc0cb]';

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get('https://emot-chtabot.onrender-1.com/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("User profile response:", response.data.userProfile);
          console.log("Profile picture data:",response.data.userProfile.profilePicture);
          setUserProfile(response.data.userProfile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
  
    fetchUserProfile();
  }, [isAuthenticated]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserProfile(null);
    setDropdownOpen(false);
    navigate("/");
  };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, [location.pathname]);
  const getOptimizedImageUrl = (url, width = 300) => {
    if (!url) return null;
    
    // Check if it's a Cloudinary URL
    if (url.includes('cloudinary.com')) {
      // Extract base URL and file path
      const urlParts = url.split('/upload/');
      if (urlParts.length === 2) {
        // Add transformations between /upload/ and the rest of the path
        return `${urlParts[0]}/upload/w_${width},c_fill,g_face/${urlParts[1]}`;
      }
    }
    
    // Return original URL if not cloudinary or can't parse
    return url;
  };
  return (
    <header className={`flex items-center justify-between p-4 ${backgroundClass} h-20 relative`}>
      {/* Profile Picture & Dropdown at left corner */}
      {isAuthenticated && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="focus:outline-none"
          >
            {userProfile && userProfile.profilePicture && userProfile.profilePicture.url ? (
  <img 
    src={getOptimizedImageUrl(userProfile.profilePicture.url, 300)} 
    alt="profile" 
    className="w-10 h-10 rounded-full object-cover border-2 border-white" 
    onError={(e) => {
      console.error("Error loading image:", e);
      e.target.onerror = null; 
      e.target.src = ''; // Set to default image or empty
      e.target.className = "hidden";
      e.target.parentNode.innerHTML = `<div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 border-2 border-white">
        ${userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
      </div>`;
    }}
  />
) : (
  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 border-2 border-white">
    {userProfile && userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
  </div>
)}
          </button>
          
          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              {userProfile && (
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">{userProfile.name}</p>
                </div>
              )}
              <NavLink 
                to="/profile" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                My Profile
              </NavLink>
              <NavLink 
                to="/dashboard" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/settings" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Settings
              </NavLink>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Links (Center) */}
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
      </nav>

      {/* Logo (Right) */}
      <div className='absolute left-15/16 transform -translate-x-1/2 hidden sm:block'>
        <NavLink to='/'>
          <img src={logo6} alt='logo' className='w-28 h-18 object-contain' />
        </NavLink>
      </div>
    </header>
  );
};

export default Navbar;