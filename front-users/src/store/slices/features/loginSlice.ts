import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface LoginState {
    page: number;
    email: string;
    password: string;
    errorEmail: string;
    errorPassword: string;
}

const initialState: LoginState = {
    page: 0,
    email: '',
    password: '',
    errorEmail: '',
    errorPassword: '',
};

export const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        setPassword: (state, action: PayloadAction<string>) => {
            state.password = action.payload;
        },
        setErrorEmail: (state, action: PayloadAction<string>) => {
            state.errorEmail = action.payload;
        },
        setErrorPassword: (state, action: PayloadAction<string>) => {
            state.errorPassword = action.payload;
        },
        resetLogin: (state) => {
            state.page = 0;
            state.email = '';
            state.password = '';
            state.errorEmail = '';
            state.errorPassword = '';
        },
    },
});

export const { setEmail, setPassword, setErrorEmail, setErrorPassword, resetLogin } = loginSlice.actions;

export default loginSlice.reducer;
