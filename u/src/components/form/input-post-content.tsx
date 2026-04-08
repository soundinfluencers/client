import React from "react";
import {
    useController,
    useFormContext,
    useFormState,
    type FieldValues,
    type Path,
} from "react-hook-form";

type Props<T extends FieldValues> = {
    name: Path<T>;
    label?: string;
    id?: string;
    placeholder?: string;
    required?: boolean;
    type?: string;
    className?: string;
    isbespoke?: boolean;
};

export function CampaignTextInput<T extends FieldValues>({
                                                             name,
                                                             label,
                                                             id,
                                                             placeholder,
                                                             required = false,
                                                             type = "text",
                                                             className = "",
                                                         }: Props<T>) {
    const { control } = useFormContext<T>();
    const { isSubmitted } = useFormState({ control });

    const { field, fieldState } = useController({
        name,
        control,
        defaultValue: "" as any,
    });

    const errorMsg = fieldState.error?.message;
    const showError = !!errorMsg && isSubmitted;

    return (
        <div className={`form-input ${className} ${showError ? "error" : ""}`}>
            {label && (
                <label htmlFor={id ?? String(name)}>
                    {label} {required ? "*" : ""}
                </label>
            )}

            <input
                id={id ?? String(name)}
                name={field.name}
                type={type}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                placeholder={placeholder}
            />

            {showError && <p className="form-input__error">{errorMsg}</p>}
        </div>
    );
}
export function CampaignTextArea<T extends FieldValues>({
                                                            name,
                                                            label,
                                                            id,
                                                            placeholder,
                                                            required = false,
                                                            className = "",
isbespoke = false,
                                                        }: Props<T>) {
    const { control } = useFormContext<T>();
    const { isSubmitted } = useFormState({ control });

    const { field, fieldState } = useController({
        name,
        control,
        defaultValue: "" as any,
    });

    const errorMsg = fieldState.error?.message;
    const showError = !!errorMsg && isSubmitted;

    return (
        <div className={`form-field ${className} ${showError ? "error" : ""}`}>
            {label && (
                <label htmlFor={id ?? String(name)}>
                    {label} {required ? "*" : ""}
                </label>
            )}

            <textarea
                id={id ?? String(name)}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                placeholder={placeholder}
                className={isbespoke ? 'bespoke' : ''}
            />

            {showError && <p className="form-input__error">{errorMsg}</p>}
        </div>
    );
}