import React from "react";
import Styles from "./loader.module.scss";

// loader during loading //

export const Loader = () => {
  return (
    <div className={Styles.loader}>
      <div className={Styles.loader__content}>
        <div className={Styles.loader_first}></div>
        <div className={Styles.loader_second}></div>
        <div className={Styles.loader_third}></div>
        <div className={Styles.loader_fourth}></div>
        <div className={Styles.loader_fifth}></div>
        <div className={Styles.loader_sixth}></div>
        <div className={Styles.loader_seventh}></div>
        <div className={Styles.loader_eighth}></div>
        <div className={Styles.loader_ninth}></div>
      </div>
    </div>
  );
};
