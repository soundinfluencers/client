import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TSignUpClientFormValues } from "@/features/auth/sign-up-client/model/sign-up-client-form.schema.ts";
import { getInitialPersonalDetails } from "@/features/auth/sign-up-client/model/sign-up-client.mappers.ts";

const SIGN_UP_CLIENT_DRAFT_TTL = 1000 * 60 * 60; // 1 hour

export interface ISignUpClientDraftState {
  personalDetails: TSignUpClientFormValues;
  updatedAt: number;

  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  setPersonalDetails: (values: TSignUpClientFormValues) => void;

  resetDraft: () => void;
}

export const useSignUpClientDraftStore = create<ISignUpClientDraftState>()(
  persist(
    (set) => ({
      personalDetails: getInitialPersonalDetails(),
      updatedAt: Date.now(),

      _hasHydrated: false,
      setHasHydrated: (value) => {
        set({ _hasHydrated: value });
      },

      setPersonalDetails: (values) => {
        set({
          personalDetails: values,
          updatedAt: Date.now(),
        });
      },

      resetDraft: () => {
        set({
          personalDetails: getInitialPersonalDetails(),
          updatedAt: Date.now(),
        });
      },
    }),
    {
      name: 'sign-up-client-draft',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const isExpired =
          Date.now() - state.updatedAt > SIGN_UP_CLIENT_DRAFT_TTL;

        if (isExpired) {
          state.resetDraft();
        }

        state.setHasHydrated(true);
      },

      partialize: (state) => ({
        personalDetails: state.personalDetails,
        updatedAt: state.updatedAt,
      }),
    }
  )
);
