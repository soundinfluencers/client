import Styles from "./loader.module.scss";

const BARS = [
  { height: 15, delay: -0 },
  { height: 49, delay: -0.2 },
  { height: 89, delay: -0.4 },
  { height: 33, delay: -0.6 },
  { height: 49, delay: -0.8 },
  { height: 85, delay: -1.0 },
  { height: 81, delay: -1.2 },
  { height: 21, delay: -1.4 },
  { height: 15, delay: -1.6 },
] as const;

export const LoaderPreview = () => (
  <div className={Styles.loader}>
    <div className={Styles.loader__content}>
      {BARS.map((bar, index) => (
        <div
          key={index}
          className={Styles.loader__bar}
          style={{ height: `${bar.height}px`, animationDelay: `${bar.delay}s` }}
        />
      ))}
    </div>
  </div>
);
