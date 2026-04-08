import React from "react";
import {
    FormProvider,
    useForm,
    type DefaultValues,
    type FieldValues,
    type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodSchema } from "zod";

type Props<T extends FieldValues> = {
    children: React.ReactNode;
    onSubmit?: (data: T) => Promise<void> | void;
    defaultValues?: DefaultValues<T>;
    schema?: ZodSchema<T>;
    className?: string;
    expose?: (methods: UseFormReturn<T>) => void;
    submitButton?: React.ReactNode;
};

export function BespokeForm<T extends FieldValues>({
                                                       children,
                                                       onSubmit,
                                                       defaultValues,
                                                       schema,
                                                       className,
                                                       expose,
                                                       submitButton
                                                   }: Props<T>) {
    const methods = useForm<T>({
        defaultValues,
        resolver: schema ? zodResolver(schema as any) : undefined,
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldUnregister: true,
    });

    React.useEffect(() => {
        expose?.(methods);
    }, [methods, expose]);

    const submit = methods.handleSubmit(
        async (data) => {
            await onSubmit?.(data);
        },
        (errors) => {
            console.log("BESPOKE INVALID SUBMIT", errors);
        },
    );

    return (
        <FormProvider {...methods}>
            <form
                className={`form ${className ?? ""}`}
                onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
                noValidate
            >
                {children}
                {submitButton && (
                    <div className={`btn-section-form`}>
                        {submitButton}
                    </div>
                )}
            </form>
        </FormProvider>
    );
}