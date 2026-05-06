// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import chevron from "@/assets/icons/chevron-right.svg";
import { OfferCard } from "./offer-card";
import { OfferSkeleton } from "@components/ui/skeletons/offer-skeleton";
import styles from "./campaign-offers-slider.module.scss";
import type {PublishedOffer} from "@/entities/client-side/campaign-creator-page/offer/model/offer.types.ts";

type Props = {
    offers: PublishedOffer[];
    isLoading: boolean;
};

export const CampaignOffersSlider: React.FC<Props> = ({
                                                          offers,
                                                          isLoading,
                                                      }) => {
    return (
        <div className={styles.wrapper}>
            <div className={`${styles.navButton} ${styles.prev}`}>
                <img src={chevron} alt="Previous" />
            </div>

            <div className={`${styles.navButton} ${styles.next}`}>
                <img src={chevron} alt="Next" />
            </div>

            <Swiper
                className={styles.slider}
                modules={[Navigation, Pagination, A11y]}
                spaceBetween={0}
                slidesPerView={4}
                navigation={{
                    nextEl: `.${styles.next}`,
                    prevEl: `.${styles.prev}`,
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
                        <SwiperSlide  key={offer.id}>
                            <OfferCard offer={offer} />
                        </SwiperSlide>
                    ))}
            </Swiper>
        </div>
    );
};