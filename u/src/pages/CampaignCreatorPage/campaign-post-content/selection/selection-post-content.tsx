import React from "react";
import Styles from "./selection.module.scss";
interface Props {}

export const Selection: React.FC<Props> = () => {
  return (
    <div className={Styles.selection}>
      <div className={Styles.selection__head}>
        <h3>Your Selection</h3>
        <button>Edit Selection</button>
      </div>
      <div className={Styles.selection__content}></div>
    </div>
  );
};
