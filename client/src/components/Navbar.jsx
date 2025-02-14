import { NavLink, useLocation } from "react-router-dom";
import logo6 from '../assets/images/logo6.jpg';

const Navbar = () => {
  const location = useLocation();  // Access current location

  // Check if the current page is '/about'
  const backgroundClass = location.pathname === '/about' ? 'bg-gradient-to-r from-blue-400 to-purple-300' : 'bg-gradient-to-r from-pink-300 to-[#ffc0cb]';

  return (
    <header className={`flex items-center justify-between p-4 ${backgroundClass} h-20`}>
      {/* Navigation Links (Left) */}
      <nav className='flex gap-8 font-medium text-lg'>
        <NavLink
          to='/'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Home
        </NavLink>
        <NavLink
          to='/about'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          About
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
          to='/login'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Login
        </NavLink>
        <NavLink
          to='/signup'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Signup
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
          to='/therapists'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Therapists
        </NavLink>
        <NavLink
          to='/communityforum'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Community Forum
        </NavLink>
        <NavLink
          to='/relaxationtools'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Relaxation Tools
        </NavLink>
        <NavLink
          to='/resource'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Resources
        </NavLink>
        <NavLink
          to='/helpline'
          className={({ isActive }) =>
            isActive ? "text-white font-bold" : "text-white hover:text-blue-200"
          }
        >
          Helplines
        </NavLink>
      </nav>

      {/* Logo (Center) */}
      <div className='absolute left-15/16 transform -translate-x-1/2 hidden sm:block'>
        <NavLink to='/'>
          <img src={logo6} alt='logo' className='w-28 h-18 object-contain' />
        </NavLink>
      </div>
    </header>
  );
};

export default Navbar;
