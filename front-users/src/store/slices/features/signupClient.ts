import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {Client, ClientCompanyType} from "../../../types/user/user.types.ts";

interface SignupClientState extends Client {
    page: number;
    password: string;
    errors: {
        firstName: boolean,
        lastName: boolean,
        company: boolean,
        companyType: boolean,
        instagramLink: boolean,
        email: boolean,
        phone: boolean
    }
}

const initialState: SignupClientState = {
    page: 0,
    firstName: '',
    lastName: '',
    company: '',
    companyType: undefined as unknown as ClientCompanyType,
    instagramLink: '',
    email: '',
    referralCode: '',
    phone: '',
    password: '',
    errors: {
        firstName: false,
        lastName: false,
        company: false,
        companyType: false,
        instagramLink: false,
        email: false,
        phone: false
    }
};

export const signupClientSlice = createSlice({
    name: 'signupClient',
    initialState,
    reducers: {
        setField: <K extends keyof SignupClientState>(
            state: SignupClientState,
            action: PayloadAction<{ key: K; value: SignupClientState[K] }>
        ) => {
            const { key, value } = action.payload;
            if (key !== 'errors' && key !== 'page') {
                state[key] = value;
            }
        },
        resetLogin: (state) => {
            state.page = 0;
            state.password = '';
        },
    },
});

export const { setField, resetLogin } = signupClientSlice.actions;

export default signupClientSlice.reducer;
