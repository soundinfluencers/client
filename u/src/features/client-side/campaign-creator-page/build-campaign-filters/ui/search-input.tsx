import searchIcon from "@/assets/icons/search (1).svg";
import styles from "./search-input.module.scss";

type Props = {
    value: string;
    onChange: (value: string) => void;
    active: boolean;
};

export const SearchInput = ({ value, onChange, active }: Props) => {
    return (
        <div className={`${styles.root} ${active ? styles.active : ""}`}>
            <img src={searchIcon} alt="" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                type="text"
                placeholder="Search"
            />
        </div>
    );
};