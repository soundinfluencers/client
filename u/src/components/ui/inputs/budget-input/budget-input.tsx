import React from "react";
import { Controller, useFormContext } from "react-hook-form";
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
}: {
  name: string; // "Your budget" (amount)
  currencyName?: string; // "Your budget currency"
  label?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const { control } = useFormContext();

  return (
    <div className={`form-input ${className}`}>
      <label htmlFor={id ?? name}>{label}</label>

      {/* currency field */}
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
                    className={selectedCurrency === c ? "active" : ""}
                    key={c}>
                    <button
                      type="button"
                      onClick={() => currencyField.onChange(c)}
                      aria-pressed={selectedCurrency === c}>
                      {c}
                    </button>
                  </li>
                ))}
              </ul>

              {/* amount field */}
              <Controller
                control={control}
                name={name as any}
                render={({ field: amountField, fieldState }) => {
                  const current = String(amountField.value ?? "");

                  return (
                    <div
                      className={`budget-input ${fieldState.invalid ? "is-error" : ""}`}>
                      <input
                        id={id ?? name}
                        type="text"
                        placeholder={placeholder}
                        value={current}
                        onChange={(e) =>
                          amountField.onChange(keepNumeric(e.target.value))
                        }
                        onBlur={amountField.onBlur}
                        name={amountField.name}
                        ref={amountField.ref}
                      />
                    </div>
                  );
                }}
              />
            </>
          );
        }}
      />
    </div>
  );
}
