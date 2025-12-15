import { useState } from "react";
import { ButtonMain } from "../../../../../../components/ui/buttons/button/Button";
import { TextInput } from "../../../../../../components/ui/inputs/text-input/TextInput";
import { SOCIAL_ACCOUNTS_DATA } from "../../../../../../constants/influencer/social-accounts.data";
import { InputPhone } from "../../ui/phone-input/InputPhone";
import plus from '@/assets/icons/plus.svg';
import edit from '@/assets/icons/edit.svg';
import { useSignupInfluencerStore } from "../../../../../../store/features/signupInfluencer";

import './_main-screen.scss';

/*
  TODO: check item bg (glass?)
*/

export const MainScreen = () => {
  const {
    accounts,
    openCreateAccount,
    openEditAcccount,
    setField,
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
  } = useSignupInfluencerStore();

  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);

  const handleSingup = () => {
    console.log(firstName, lastName, email, phoneNumber, password);
  };

  return (
    <div className="signup-influencer">
      <div className="signup-influencer__header">
        <p className="signup-influencer__title">Complete your application</p>
        <p className="signup-influencer__subtitle">Get approved to join the SoundInfluencers network</p>
      </div>

      <div>
        <p className="signup-influencer__inputs-label">Add Your Personal Details</p>
        <div className="signup-influencer__inputs">
          <TextInput
            title="First name*"
            placeholder="Enter first name"
            value={firstName}
            setValue={(v) => setField('firstName', v)}
          />
          <TextInput
            title="Last name*"
            placeholder="Enter last name"
            value={lastName}
            setValue={(v) => setField('lastName', v)}
          />
          <TextInput
            title="Email*"
            type="email"
            placeholder="Enter email"
            value={email}
            setValue={(v) => setField('email', v)}
          />
          <InputPhone
            value={phoneNumber}
            setValue={(v) => setField('phoneNumber', v)}
            isMenuOpen={isPhoneDropdownOpen}
            setIsMenuOpen={setIsPhoneDropdownOpen}
          />
          <TextInput
            title="Password*"
            type="password"
            value={password}
            placeholder="Enter password"
            setValue={(v) => setField('password', v)} />
        </div>
      </div>

      <div className="signup-influencer__socials">
        <div className="signup-influencer__socials-header">
          <p className="signup-influencer__socials-title">Connect your social accounts</p>
          <p className="signup-influencer__socials-subtitle">Add at least one platform to submit your application</p>
        </div>

        <ul className="signup-influencer__socials-list">
          {SOCIAL_ACCOUNTS_DATA.map(({ id, label, icon }) => (
            <li className="signup-influencer__socials-item" key={id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="signup-influencer__social">
                  <img className="signup-influencer__social-icon" src={icon} alt={label} />
                  <p className="signup-influencer__social-label">{label}</p>
                </div>
                <button
                  className="signup-influencer__social-btn"
                  onClick={() => openCreateAccount(id)}
                >
                  <img src={plus} alt="Plus" />
                </button>
              </div>
              {accounts.filter(a => a.platform === id).length !== 0 && (
                <ul className="signup-influencer__accounts-list">
                  {accounts.filter(a => a.platform === id).map((account, index) => (
                    <li key={account.clientId} className="signup-influencer__accounts-item">
                      <div className="signup-influencer__accounts-info">
                        <span>{index + 1}</span>
                        <p>{account.username}</p>
                      </div>
                      <button
                        className="signup-influencer__accounts-edit"
                        onClick={() => openEditAcccount(account.clientId)}
                      >
                        Edit
                        <img src={edit} alt="Edit" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="signup-influencer__controls">
        <ButtonMain isDisabled text="Submit Application" onClick={handleSingup} />
      </div>
    </div>
  )
}
