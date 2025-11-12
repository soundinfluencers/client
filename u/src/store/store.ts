import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './slices/features/loginSlice.ts';
import authNavReducer from './slices/navigation/authNavSlice.ts';
import signupClientReducer from "./slices/features/signupClient.ts";

export const store = configureStore({
    reducer: {
        authNavSlice: authNavReducer,
        login: loginReducer,
        signupClient: signupClientReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;