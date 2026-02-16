import React, { useEffect, useState } from "react";
import { useUser } from "@/store/get-user";
import { useController, useFormContext } from "react-hook-form";
import { AmountSelector } from "@/pages/influencer/create-invoice/components/amount-selector/AmountSelector.tsx";
import type {
  InvoiceFormValues,
} from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types.ts";
import './_amount-input.scss';

export const AmountInput = () => {
  const [displayValue, setDisplayValue] = useState<string>("");
  const lastManualValue = React.useRef<number | null>(null);

  const { control, setValue, getValues, clearErrors } = useFormContext<InvoiceFormValues>();
  const { user } = useUser();

  const { field: amountField, fieldState } = useController({
    name: 'amount',
    control,
  });
  const { field: amountTypeField } = useController({
    name: 'amountType',
    control,
  });

  const select = amountTypeField.value; // 'balance' | 'other'
  const error = fieldState.error;

  useEffect(() => {
    if (select === 'balance') {
      setDisplayValue(user?.balance ? String(user.balance) : '');
      return;
    }

    setDisplayValue(amountField.value === null ? '' : String(amountField.value));
  }, [amountField.value, select, user?.balance]);

  useEffect(() => {
    if (select !== 'balance') return;
    if (!user?.balance) return;

    const current = getValues('amount');

    if (!current) {
      setValue('amount', user.balance, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [select, user?.balance, getValues, setValue]);

  const handleSelect = (value: 'balance' | 'other') => {
    if (value === select) return;

    amountTypeField.onChange(value);

    if (value === 'balance') {
      lastManualValue.current = getValues('amount') ?? null;

      setValue('amount', user?.balance ?? null, {
        shouldDirty: false,
        shouldValidate: true,
      });
      clearErrors("amount");
      setDisplayValue(String(user?.balance ?? 0));
      return;
    }

    const restore = lastManualValue.current ?? null;

    setValue('amount', restore, {
      shouldDirty: false,
      shouldValidate: false,
      shouldTouch: false,
    });
    clearErrors("amount");
    setDisplayValue(restore === null ? '' : String(restore));
  };

  const sanitizeDigits = (raw: string) => raw.replace(/\D/g, "");

  const commitToForm = (digits: string) => {
    if (digits === "") {
      lastManualValue.current = null;
      amountField.onChange(null);
      return;
    }
    const num = Number(digits);
    lastManualValue.current = num;
    amountField.onChange(num);
  };

  return (
    <div className="amount-input">
      <AmountSelector select={select} onSelect={handleSelect}/>

      {select === 'other' && (
        <>
          <label
            htmlFor="amount"
            className={`amount-input__label ${select !== 'other' ? 'amount-input__label--disabled' : ''} ${error ? 'amount-input__label--error' : ''}`}
          >
            Enter Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode={'numeric'}
            pattern={'[0-9]*'}
            placeholder="234"
            className={`amount-input__field ${error ? 'amount-input__field--error' : ''}`}
            disabled={select !== 'other'}
            value={displayValue}
            onChange={(e) => {
              if (/\D/.test(e.target.value)) {
                // If non-digit characters are present, ignore the change
                return;
              }
              const nextDigits = sanitizeDigits(e.target.value);
              setDisplayValue(nextDigits);
              commitToForm(nextDigits);
            }}
            onBlur={() => {
              setValue('amount', getValues("amount"), {
                shouldTouch: false,
                shouldValidate: false,
              })
            }}
          />
          {error && <p className="amount-input__error-message">{error.message}</p>}
        </>
      )
      }
      <p className="amount-input__description">
        Please note that required numbers for receiving money through bank transfers can vary depending on your country.
        If you are uncertain about the specific requirements, we recommend contacting your bank directly for information
        regarding international payments.
      </p>
    </div>
  );
};