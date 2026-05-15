import { forwardRef, useImperativeHandle, useRef } from "react";
import clsx from "clsx";

import s from "./country-code-list.module.scss";
import type { PhoneCountry } from "@/features/auth/sign-up-client/ui/input-helpers/model/phone-utils.ts";
import { Input } from "@/features/auth/sign-up-client/ui/input/input.tsx";
import { CountryFlag } from "@/features/auth/sign-up-client/ui/input-helpers/country-flag/country-flag.tsx";

export interface CountryCodeListRef {
    focusSearch: () => void;
}

interface CountryCodeListProps {
    selectedCountry: PhoneCountry;
    searchInputId: string;
    countryCodes: PhoneCountry[];
    searchValue: string;
    setSearchValue: (value: string) => void;
    onSelectCountry: (country: PhoneCountry) => void;
    isOpen: boolean;
}

const SearchIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
            stroke="#2A2A2A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M21 21.0004L16.65 16.6504"
            stroke="#2A2A2A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M20 6L9 17L4 12"
            stroke="#B9D0FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const CountryCodeList = forwardRef<CountryCodeListRef, CountryCodeListProps>(
    (
        {
            selectedCountry,
            countryCodes,
            searchInputId,
            searchValue,
            setSearchValue,
            onSelectCountry,
            isOpen,
        },
        ref,
    ) => {
        const searchInputRef = useRef<HTMLInputElement | null>(null);

        useImperativeHandle(
            ref,
            () => ({
                focusSearch: () => {
                    searchInputRef.current?.focus();
                },
            }),
            [],
        );

        return (
            <div className={clsx(s.countryCodeList, isOpen && s.listOpen)}>
                <div className={s.searchWrapper}>
                    <Input
                        ref={searchInputRef}
                        className={s.searchInput}
                        name={searchInputId}
                        id={searchInputId}
                        type="text"
                        placeholder="Search for countries"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        leftSlot={<SearchIcon className={s.searchIcon} />}
                    />
                </div>

                <div className={s.listViewport}>
                    <ul className={s.list} role="listbox">
                        {countryCodes.map((country) => {
                            const selected = selectedCountry.iso2 === country.iso2;

                            return (
                                <li
                                    key={country.iso2}
                                    className={s.item}
                                    role="option"
                                    aria-selected={selected}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        onSelectCountry(country);
                                    }}
                                >
                                    <CountryFlag iso2={country.iso2} />

                                    <span className={s.label}>
                    {country.countryName} ({country.dialCode})
                  </span>

                                    {selected && <CheckIcon className={s.iconCheck} />}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    },
);

CountryCodeList.displayName = "CountryCodeList";