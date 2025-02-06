import { Link } from "react-router-dom";
import { arrow } from "../assets/icons";

const HomeInfo = () => {
  return (
    <div className='text-center'>
      <h1 className='sm:text-xl sm:leading-snug neo-brutalism-blue py-4 px-8 text-white mx-5'>
        <span className='typing-effect'>
          Hi, I'm <span className='font-bold text-[24px] '>SENTIO.</span>
          <br />
          {/* This text will disappear on small devices */}
          <span className='hidden sm:block'>
            Your sanctuary for introspection and growth.
          </span>
        </span>
      </h1>

      {/* "Get Started" Button */}
      <div className='flex flex-col items-center'>
  <Link
    to='/login'
    className='inline-block mt-6 bg-[#f64a8a] text-white px-6 py-2 rounded-lg hover:bg-pink-500 transition-colors'
  >
    Get Started
  </Link>

  <Link
    to='/avatarexp' // Replace with your desired route
    className='inline-block mt-2 bg-[#ff1e56] text-white px-6 py-2 rounded-xl hover:bg-[#ff0844] transition duration-300 shadow-2xl shadow-[#ff1e56]/60 hover:shadow-pink-400/70 transform hover:scale-105'
  >
    Try Sentio's 3D Avatar
  </Link>
</div>



    </div>
  );
};

export default HomeInfo;
