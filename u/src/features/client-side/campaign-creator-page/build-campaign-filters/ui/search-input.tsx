import searchIcon from "@/assets/icons/search (1).svg";
import styles from "./search-input.module.scss";

type Props = {
    value: string;
    onChange: (value: string) => void;
    active: boolean;
    disabled?: boolean;
};

export const SearchInput = ({
    value,
    onChange,
    active,
    disabled = false,
}: Props) => {
    return (
        <div
            className={`${styles.root} ${active ? styles.active : ""} ${
                disabled ? styles.disabled : ""
            }`}
        >
            <img src={searchIcon} alt="" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                type="text"
                placeholder="Search"
                disabled={disabled}
            />
        </div>
    );
};
