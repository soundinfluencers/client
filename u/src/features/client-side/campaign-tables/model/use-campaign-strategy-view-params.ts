import {
    parseAsBoolean,
    parseAsInteger,
    useQueryStates,
} from "nuqs";

export type StrategyViewMode = -1 | 0 | 1;

const normalizeView = (value: number | null | undefined): StrategyViewMode => {
    if (value === -1) return -1;
    if (value === 1) return 1;
    return 0;
};

export const useCampaignStrategyViewParams = ({
                                                  isProposal,
                                              }: {
    isProposal?: boolean;
}) => {
    const [params, setParams] = useQueryStates(
        {
            view: parseAsInteger.withDefault(isProposal ? -1 : 0),
            insights: parseAsBoolean.withDefault(false),
        },
        {
            shallow: false,
            clearOnDefault: true,
        },
    );

    const rawView = normalizeView(params.view);

    const view: StrategyViewMode =
        isProposal
            ? rawView
            : rawView === -1
                ? 0
                : rawView;

    return {
        view,
        setView: (value: StrategyViewMode) => {
            if (!isProposal && value === -1) {
                setParams({ view: 0 });
                return;
            }

            setParams({ view: value });
        },

        insights: params.insights,
        setInsights: (value: boolean) => setParams({ insights: value }),
    };
};