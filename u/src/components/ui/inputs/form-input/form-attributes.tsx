import React from "react";
import "./_form-attributes.scss";
import {
    useController,
    useFormContext,
    get,
    type FieldValues,
    type Path,
    type RegisterOptions,
} from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
    name: Path<T>;
    label?: string;
    id?: string;
    placeholder: string;
    required?: boolean;
    type?: string;
    className?: string;
    validation?: RegisterOptions;
}

interface FormTextAreaProps<T extends FieldValues> {
    name: Path<T>;
    id?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    isBespoke?: boolean;
    validation?: RegisterOptions;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps<any>>(
    (
        {
            name,
            label,
            placeholder,
            required = false,
            type = "text",
            className = "",
            id,
            validation,
        },
        ref,
    ) => {
        const {
            control,
            formState: { errors, submitCount },
        } = useFormContext();

        const { field } = useController({
            name,
            control,
            rules: validation,
            defaultValue: "",
        });

        const errorMsg =
            (get(errors, name)?.message as string | undefined) ?? undefined;

        const showError = !!errorMsg && submitCount > 0;

        return (
            <div className={`form-input ${className} ${showError ? "error" : ""}`}>
                {label && (
                    <label htmlFor={id ?? String(name)}>
                        {label} {required ? "*" : ""}
                    </label>
                )}

                <input
                    id={id ?? String(name)}
                    type={type}
                    placeholder={placeholder}
                    value={field.value ?? ""}
                    onChange={(e) =>
                        field.onChange(
                            type === "number" ? Number(e.target.value) : e.target.value,
                        )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={(el) => {
                        field.ref(el);
                        if (typeof ref === "function") ref(el);
                        else if (ref) {
                            (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
                        }
                    }}
                />

                {showError && <p className="form-input__error">{errorMsg}</p>}
            </div>
        );
    },
);

FormInput.displayName = "FormInput";

export function FormTextArea<T extends FieldValues>({
                                                        name,
                                                        label,
                                                        placeholder,
                                                        required = false,
                                                        className = "",

                                                        id,
                                                        validation,
                                                    }: FormTextAreaProps<T>) {
    const {
        control,
        formState: { errors, submitCount },
    } = useFormContext();

    const { field } = useController({
        name,
        control,
        rules: validation,
        defaultValue: "",
    });

    const errorMsg =
        (get(errors, name)?.message as string | undefined) ?? undefined;

    const showError = !!errorMsg && submitCount > 0;

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
            />

            {showError && <p className="form-input__error">{errorMsg}</p>}
        </div>
    );
}