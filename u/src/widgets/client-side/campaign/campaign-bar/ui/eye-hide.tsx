import eye from "@/assets/icons/eye.svg";
import closeEye from "@/assets/icons/eye-off.svg";
import styles from "./eye-hide.module.scss";

type Props = {
    isHidden: boolean;
    onToggle: () => void;
};

export const EyeHide = ({ isHidden, onToggle }: Props) => {
    return (
        <button type="button" className={styles.eye} onClick={onToggle}>
            <img
                src={isHidden ? closeEye : eye}
                alt={isHidden ? "Hidden" : "Visible"}
            />
        </button>
    );
};