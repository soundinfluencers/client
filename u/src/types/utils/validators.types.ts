export interface PhoneValidationResult {
    isValid: boolean;
    country?: {
        name: string;
        flag: string;
        placeholder: string;
    };
}