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
    onValuesChange?: (data: T) => void;
    renderSubmit?: (methods: UseFormReturn<T>) => React.ReactNode;
};

export function CampaignPostContentForm<T extends FieldValues>({
                                                                   children,
                                                                   onSubmit,
                                                                   defaultValues,
                                                                   schema,
                                                                   className,
                                                                   expose,
                                                                   onValuesChange,
                                                                   renderSubmit,
                                                               }: Props<T>) {
    const methods = useForm<T>({
        defaultValues,
        resolver: schema ? zodResolver(schema as any) : undefined,
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldUnregister: false,
    });

    React.useEffect(() => {
        expose?.(methods);
    }, [methods, expose]);

    React.useEffect(() => {
        if (!onValuesChange) return;
        const subscription = methods.watch((values) => {
            onValuesChange(values as T);
        });
        return () => subscription.unsubscribe();
    }, [methods, onValuesChange]);

    const submit = methods.handleSubmit(
        async (data) => {
            console.log("VALID SUBMIT", data);
            await onSubmit?.(data);
        },
        (errors) => {
            console.log("INVALID SUBMIT", errors);
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

                <div className="btn-section-form">
                    {renderSubmit?.(methods)}
                </div>
            </form>
        </FormProvider>
    );
}