import React from "react";
import avatarIImg from "../assets/images/1.jpg";
import avatarIIImg from "../assets/images/2.jpg";
import avatarIIIImg from "../assets/images/3.jpg";
import avatarIVImg from "../assets/images/4.jpg";
import avatarVImg from "../assets/images/5.jpg";
import pinkBg from "../assets/images/pink-bg4.jpg"
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./Testimonials.css";
export default function Testimonials() {
  const testimonials = [
    {
      img: avatarIImg,
      text: "This service has been a game-changer for me! The experience was seamless, and I couldn't be happier with the results.",
      author: "— Alexa Johnson",
    },
    {
      img: avatarIIImg,
      text: "Absolutely incredible! The attention to detail and the level of support provided exceeded my expectations.",
      author: "— Sarah Williams",
    },
    {
      img: avatarIIIImg,
      text: "I highly recommend it! The team is fantastic, and they truly care about making sure you get the best experience possible.",
      author: "— Michaela Lee",
    },
    {
      img: avatarIVImg,
      text: "One of the best experiences I’ve had. The process was smooth, and the results were outstanding.",
      author: "— Emily Davis",
    },
    {
      img: avatarVImg,
      text: "A truly transformative experience! The level of professionalism and quality is top-notch.",
      author: "— David Smith",
    },
  ];

  return (
    <section>
      <div className="main">
        <div className="head-p">
          <span style={{ paddingRight: "5px", color : "#ffc0cb" }}>GET AN </span>
          <span style={{ color: "#5CE0E6" }}> OPINION</span>
        </div>
        <div className="head">TESTIMONIALS</div>
        <Swiper
          loop={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          navigation={true}
          modules={[Autoplay, EffectCoverflow, Pagination, Navigation]}
          className="mySwiper"
          effect={"coverflow"}
          coverflowEffect={{
            rotate: 10,
            stretch: 50,
            depth: 200,
            modifier: 1,
            slideShadows: true,
          }}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 150 },
          }}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              <div style={{ paddingRight: 20, paddingLeft: 20 }}>
                <div className="testimonials-profile-circle">
                  <img src={testimonial.img} alt="testimonial-avatar" className="testimonial-avatar" />
                </div>
                <p>{testimonial.text}</p>
                <h6 className="review-by">{testimonial.author}</h6>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
