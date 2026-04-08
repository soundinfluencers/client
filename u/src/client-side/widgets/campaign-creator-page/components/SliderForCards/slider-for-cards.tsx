import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { Card } from "./card/card";
import chevron from "@/assets/icons/chevron-right.svg";
import "./_slider.scss";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";


import { OfferSkeleton } from "@/components/ui/skeletons/offer-skeleton";
import type {Offer} from "@/client-side/types/offers.ts";

interface Props {
  offers: Offer[];
  isLoading: boolean;
}

export const SliderForCard: React.FC<Props> = ({ offers, isLoading }) => {
  return (
      <div className="slider-wrapper" style={{ position: "relative" }}>
        <div className="swiper-button-prev">
          <img src={chevron} alt="prev" />
        </div>

        <div className="swiper-button-next">
          <img src={chevron} alt="next" />
        </div>

        <Swiper
            className="slider"
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={0}
            slidesPerView={4}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 0 },
              600: { slidesPerView: 2, spaceBetween: 0 },
              900: { slidesPerView: 3, spaceBetween: 0 },
              1200: { slidesPerView: 4, spaceBetween: 0 },
              1600: { slidesPerView: 4, spaceBetween: 0 },
            }}
            pagination={{ clickable: true }}
        >
          {isLoading
              ? Array.from({ length: 12 }).map((_, index) => (
                  <SwiperSlide key={index}>
                    <OfferSkeleton />
                  </SwiperSlide>
              ))
              : offers.map((offer) => (
                  <SwiperSlide key={offer._id}>
                    <Card dataCard={offer} />
                  </SwiperSlide>
              ))}
        </Swiper>
      </div>
  );
};