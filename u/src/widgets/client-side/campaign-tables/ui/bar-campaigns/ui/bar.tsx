import styles from "./bar.module.scss";

type Props = {
    submittedLabel: string;
    budgetLabel: string;
    reachLabel: string;
    postsLabel: string;
    videosLabel: string;
};

export const Bar: React.FC<Props> = ({
                                         submittedLabel,
                                         budgetLabel,
                                         reachLabel,
                                         postsLabel,
                                         videosLabel,
                                     }) => {
    const barUIs = [
        { name: submittedLabel, row: true },
        { name: budgetLabel, row: true },
        { name: reachLabel, row: true },
        { name: postsLabel, row: true },
        { name: videosLabel, row: false },
    ];

    return (
        <div className={styles.bar}>
            {barUIs.map((item, i) => (
                <div key={i} className={styles.barButton}>
                    <p>{item.name}</p>
                    {item.row && <div className={styles.barRow} />}
                </div>
            ))}
        </div>
    );
};