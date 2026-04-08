export type PlatformFormField = {
    id: string;
    name: string;
    placeholder: string;
    required?: boolean;
};

export type PlatformFormTextArea = {
    id: string;
    name: string;
    placeholder: string;
    required?: boolean;
};

export type PlatformFormConfig = {
    inputs: PlatformFormField[];
    textAreas?: PlatformFormTextArea[];
    contentTitle: string;
};