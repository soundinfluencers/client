import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { Card } from "./card/card";
import chevron from "@/assets/icons/chevron-right.svg";
import "./_slider.scss";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useCampaignStore } from "@/store/client/createCampaign";
import type { IApiOffer } from "@/types/client/creator-campaign/creator-campaign.types";

interface Props {
  offers: IApiOffer[];
}

export const SliderForCard: React.FC<Props> = ({ offers }) => {
  const { offer, activeOfferId } = useCampaignStore();

  const { actions } = useCampaignStore();

  React.useEffect(() => {
    if (!offer) return;

    actions.setPromoCards(offer.connectedAccounts);
  }, [offer, activeOfferId]);
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
          320: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          600: {
            slidesPerView: 2,
            spaceBetween: 0,
          },
          900: {
            slidesPerView: 3,
            spaceBetween: 0,
          },
          1200: {
            slidesPerView: 4,
            spaceBetween: 0,
          },
          1600: {
            slidesPerView: 4,
            spaceBetween: 0,
          },
        }}
        pagination={{ clickable: true }}>
        {offers?.map((data) => (
          <SwiperSlide key={data._id}>
            <Card dataCard={data} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
