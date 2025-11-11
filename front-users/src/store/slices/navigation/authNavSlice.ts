import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthNavState {
    page: number;
}

const initialState: AuthNavState = {
    page: 0,
}

export const authNavSlice = createSlice({
    name: 'authNavigation',
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        resetState: (state) => {
            state.page = 0;
        }
    }
})

export const { setPage, resetState } = authNavSlice.actions;

export default authNavSlice.reducer;