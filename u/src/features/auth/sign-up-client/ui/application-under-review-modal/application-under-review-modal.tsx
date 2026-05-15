import React from "react";
import { Link } from "react-router-dom";



import successCheck from '../../assets/success-check.png';

import s from './application-under-review-modal.module.scss';
import {getLoginRoute} from "@/features/auth/sign-up-client/model/get-login-route.ts";
import {Modal} from "@/shared/ui/modal-fix/Modal.tsx";
import { Button } from "../button/button";

interface ApplicationUnderReviewModalProps {
  role: any;
  onClose: () => void;
}

export const ApplicationUnderReviewModal: React.FC<ApplicationUnderReviewModalProps> = ({
  role,
  onClose,
}) => {
  return (
    <Modal
      onClose={onClose}
    >
      <div className={s.header}>
        <img
          className={s.img}
          src={successCheck}
          alt="Application under review"
          width={113}
          height={82}
        />
        <div className={s.info}>
          <h2 className={s.title}>Application under review</h2>
          <div className={s.block}>
            <p className={s.subtitle}>Thank you for submitting your details - our team will review your application shortly</p>
            <p className={s.text}>
              If your application meets our criteria, we’ll get in touch with you promptly.{'\n'}
              We appreciate your patience and look forward to welcoming you soon.
            </p>
          </div>
        </div>
      </div>

      <Button
        className={s.btn}
        as={Link}
        variant="primary"
        to={getLoginRoute(role)}
        size="large"
      >
        Got it
      </Button>
    </Modal>
  );
};
