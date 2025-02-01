import { Link } from "react-router-dom";
import { arrow } from "../assets/icons";

const HomeInfo = () => {
  return (
    <div className='text-center'>
      <h1 className='sm:text-xl sm:leading-snug neo-brutalism-blue py-4 px-8 text-white mx-5'>
        <span className='typing-effect'>
          Hi, I'm <span className='font-bold text-[24px] '>SENTIO.</span>
          <br />
          Your sanctuary for introspection and growth.
        </span>
      </h1>

      {/* "Get Started" Button */}
      <Link
        to='/login' // Replace with your desired route
        className='inline-block mt-6 bg-[#f64a8a] text-white px-6 py-2 rounded-lg hover:bg-pink-500 transition-colors'
      >
        Get Started
      </Link>
    </div>
    
  );
};

export default HomeInfo;