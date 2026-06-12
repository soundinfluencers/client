type Props = {
    value?: number | null;
};

export const MetricCell = ({ value }: Props) => {
    return <p>{value ?? "-"}</p>;
};