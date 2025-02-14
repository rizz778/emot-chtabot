import { Link } from "react-router-dom";
import { arrow } from "../assets/icons";

const AboutInfo = () => {
  return (
    <div className="about-info-container mt-0">
<div className="text-center mt-0">
      <h1 className='sm:text-xl sm:leading-snug neo-brutalism-blue py-4 px-8 text-white mx-5 mt-0 abh1'>
        <span className="abhd">
        WELCOME TO SENTIO
        </span>
      </h1></div>
      <br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br />
<div className="hidden sm:block mt-21">
      <p className="neo-brutalism-blue py-4 px-8 text-white font-bold">
        SENTIO is an advanced AI-powered emotional support chatbot designed to help individuals
        navigate through emotional challenges. Our goal is to provide empathetic and personalized 
        assistance, offering a safe space for users to express their feelings. Through dynamic 
        conversations and emotion recognition, SENTIO tailors its responses to meet each individual's 
        emotional needs. Whether you're facing stress, anxiety, or simply need someone to talk to, 
        SENTIO is here to listen and support you every step of the way.
      </p></div>
      <div className="block sm:hidden">
      <p className="typing-effect-paragraph">
        SENTIO is an advanced AI-powered emotional support chatbot designed to help individuals
        navigate through emotional challenges. 
      </p>
      </div>
    </div>
    
  );
};

export default AboutInfo;
