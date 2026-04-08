import styles from "./draft-button.module.scss";
import icon from '@/assets/icons/folder-plus.svg'


type Props = {
    onClick: () => void;
}


export const DraftButton = ({onClick}: Props) => {
    return (
        <button className={styles.draftButton} onClick={onClick}>
            <img src={icon} alt=""/>
            Save Draft
        </button>
    );
};