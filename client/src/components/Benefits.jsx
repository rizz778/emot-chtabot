import { benefits } from "../constants";
import Heading from "./Heading";
import Section from "./Section";
import Arrow from "../assets/svg/Arrow";
import { GradientLight } from "./design/Benefits";
import ClipPath from "../assets/svg/ClipPath";
const Benefits = () => {
    return (
      <Section id="features">
        <div className="container relative z-2">
          <div className="text-center">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
              <span className="text-[#f64a8a]">SPEAK, TYPE, HEAL. </span> 
              <span className="text-[#5CE0E6]">ANYTIME, ANYWHERE. </span>
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
              <span className="text-[#5CE0E6] mx-auto">FEATURES </span>
            </h1>
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10 mb-10 justify-items-center mt-3">
            {benefits.map((item) => (
              <div
                className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] max-w-[20rem] max-h-[19rem] mx-auto"
                style={{
                  backgroundImage: `url(${item.backgroundUrl})`,
                }}
                key={item.id}
              >
                <div className="relative z-2 flex flex-col min-h-[22rem] p-[2.4rem] pointer-events-none">
                  <h5 className="h5 mb-5 font-extrabold text-[purple] text-[19px]">{item.title}</h5> {/* Title made bold and darker */}
                  <p className="body-2 mb-6 text-black text-[14px] font-bold">{item.text}</p> {/* Text made darker */}
                  <div className="flex items-center mt-auto">
                    <img
                      src={item.iconUrl}
                      width={48}
                      height={48}
                      alt={item.title}
                    />
                    <p className="ml-auto font-code text-xs font-bold text-n-1 uppercase tracking-wider">
                      Explore more
                    </p>
                    <Arrow />
                  </div>
                </div>
  
                {item.light && <GradientLight />}
  
                <div
                  className="absolute inset-0.5 bg-n-8"
                  style={{ clipPath: "url(#benefits)" }}
                >
                  <div className="absolute inset-0 opacity-40 transition-opacity hover:opacity-90">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        width={380}
                        height={362}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
  
                <ClipPath />
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  };
  
  export default Benefits;
  