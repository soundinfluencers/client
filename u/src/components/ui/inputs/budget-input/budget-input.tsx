import React from "react";
import {
    Controller,
    get,
    useFormContext,
    useFormState,
} from "react-hook-form";
import "./budget-input.scss";

const CURRENCIES = ["£", "$", "€"] as const;
type Currency = (typeof CURRENCIES)[number];

const keepNumeric = (v: string) => v.replace(/[^\d.,]/g, "").trim();

export function BudgetField({
                                name,
                                currencyName = "Your budget currency",
                                label = "Your budget",
                                placeholder = "Enter your budget",
                                className = "",
                                id,
                                required = false,
                            }: {
    name: string;
    currencyName?: string;
    label?: string;
    placeholder?: string;
    className?: string;
    id?: string;
    required?: boolean;
}) {
    const { control } = useFormContext();
    const { errors, isSubmitted } = useFormState({ control });

    const errorMsg =
        (get(errors, name)?.message as string | undefined) ?? undefined;

    const showError = !!errorMsg && isSubmitted;

    return (
        <div className={`form-input ${className} ${showError ? "error" : ""}`}>
            <label htmlFor={id ?? name}>
                {label} {required ? "*" : ""}
            </label>

            <Controller
                control={control}
                name={currencyName as any}
                defaultValue={"£"}
                render={({ field: currencyField }) => {
                    const selectedCurrency = (currencyField.value as Currency) ?? "£";

                    return (
                        <>
                            <ul className="budget-currency">
                                {CURRENCIES.map((c) => (
                                    <li
                                        key={c}
                                        onClick={() => currencyField.onChange(c)}
                                        className={selectedCurrency === c ? "active" : ""}
                                    >
                                        <button type="button" aria-pressed={selectedCurrency === c}>
                                            {c}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <Controller
                                control={control}
                                name={name as any}
                                defaultValue=""
                                render={({ field }) => {
                                    const current = String(field.value ?? "");

                                    return (
                                        <div className={`budget-input ${showError ? "error" : ""}`}>
                                            <input
                                                id={id ?? name}
                                                type="text"
                                                placeholder={placeholder}
                                                value={current}
                                                onChange={(e) =>
                                                    field.onChange(keepNumeric(e.target.value))
                                                }
                                                onBlur={field.onBlur}
                                                name={field.name}
                                                ref={field.ref}
                                            />
                                        </div>
                                    );
                                }}
                            />

                            {showError && <p className="form-input__error">{errorMsg}</p>}
                        </>
                    );
                }}
            />
        </div>
    );
}