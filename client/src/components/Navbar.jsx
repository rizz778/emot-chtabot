import { NavLink } from "react-router-dom";
import logo6 from "../assets/images/logo6.jpg";

const Navbar = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-300 via-[#f64a8a] to-purple-400 h-20">
      {/* Navigation Links (Left) */}
      <nav className="flex gap-8 font-medium text-lg">
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "text-black font-bold" : "text-black hover:text-blue-200"
          }
        >
          About
        </NavLink>
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive ? "text-black font-bold" : "text-black hover:text-blue-200"
          }
        >
          Login
        </NavLink>
        <NavLink
          to="/signup"
          className={({ isActive }) =>
            isActive ? "text-black font-bold" : "text-black hover:text-blue-200"
          }
        >
          Signup
        </NavLink>
      </nav>

      {/* Logo (Center) */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <NavLink to="/">
          <img src={logo6} alt="logo" className="w-28 h-18 object-contain" />
        </NavLink>
      </div>
    </header>
  );
};

export default Navbar;
