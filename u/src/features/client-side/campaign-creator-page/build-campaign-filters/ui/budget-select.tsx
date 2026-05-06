import React from "react";
import type {
    CampaignCurrencyOption,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";
import {
    CAMPAIGN_CURRENCY_OPTIONS,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/build-campaign-params.constants.ts";

import styles from "./budget-select.module.scss";
import {
    DropdownSelect
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/ui/dropdown-select.tsx";

type Props = {
    setBudget: (budget: number) => void;
    setCurrency: (currency: CampaignCurrencyOption) => void;
    currencySelected: CampaignCurrencyOption;
    budgetSelected: number;
};

export const BudgetSelect = ({
                                 currencySelected,
                                 budgetSelected,
                                 setBudget,
                                 setCurrency,
                             }: Props) => {
    const [open, setOpen] = React.useState(false);

    return (
        <div className={styles.root}>
            <DropdownSelect
                selected={`Budget: ${budgetSelected} ${currencySelected?.key}`}
                isOpen={open}
                setOpen={setOpen}
            >
                <div className={styles.currency}>
                    <ul>
                        {CAMPAIGN_CURRENCY_OPTIONS.map((cr) => (
                            <li
                                className={`${styles.currencyItem} ${
                                    cr.key === currencySelected?.key ? styles.currencyItemActive : ""
                                }`}
                                onClick={() => {
                                    setCurrency(cr);
                                    setOpen(false);
                                }}
                                key={cr.key}
                            >
                                {cr.key}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.price}>
                    <label className={styles.label} htmlFor="price">
                        Price
                    </label>
                    <input
                        className={styles.input}
                        type="number"
                        id="price"
                        value={budgetSelected || ""}
                        onChange={(e) => setBudget(Number(e.target.value))}
                    />
                </div>
            </DropdownSelect>
        </div>
    );
};