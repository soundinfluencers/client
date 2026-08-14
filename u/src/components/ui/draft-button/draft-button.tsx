import styles from "./draft-button.module.scss";
import icon from '@/assets/icons/folder-plus.svg'


type Props = {
    onClick: () => void;
    isDisabled?: boolean;
}


export const DraftButton = ({onClick, isDisabled = false}: Props) => {
    return (
        <button
            type={'button'}
            className={styles.draftButton}
            onClick={onClick}
            disabled={isDisabled}
        >
            <img src={icon} alt=""/>
            Save Draft
        </button>
    );
};
