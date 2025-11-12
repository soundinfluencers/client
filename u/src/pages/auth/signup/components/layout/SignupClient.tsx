import '../../_signup-page.scss';
import {TextInput} from "../../../../../components/ui/inputs/text-input/TextInput.tsx";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../../../../../store/store.ts";
import {setField} from "../../../../../store/slices/features/signupClient.ts";
import {ButtonMain} from "../../../../../components/ui/buttons/button/Button.tsx";
import {RadioButton} from "../../../../../components/ui/buttons/radio/RadioButton.tsx";
import {useState} from "react";
import {InputPhone} from "../ui/phone-input/InputPhone.tsx";

export const SignupClient = () => {
    const dispatch: AppDispatch = useDispatch();

    const fields = useSelector((state: RootState) => state.signupClient);

    const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
    const [repeatPassword, setRepeatPassword] = useState<string>('');

    const handleSignup = () => {
        console.log(fields)
    }

    return (
        <div className="signup-client">
            <div className="signup-client__title-block">
                <p className="signup-client__title">Add your details here</p>
                <p className="signup-client__subtitle">to get approved as a Sponsoring Client</p>
            </div>

            <div className="signup-client__inputs">
                <TextInput title='First name'
                           value={fields.firstName}
                           setValue={(value) => dispatch(setField({key: 'firstName', value: value}))}
                           placeholder="Enter first name"/>
                <TextInput title='Last name'
                           value={fields.lastName}
                           setValue={(value) => dispatch(setField({key: 'lastName', value: value}))}
                           placeholder="Enter last name"/>
                <TextInput title='Company'
                           value={fields.company}
                           setValue={(value) => dispatch(setField({key: 'company', value: value}))}
                           placeholder="Enter company"/>
                <TextInput title='Company type'
                           value={fields.companyType}
                           setValue={(value) => dispatch(setField({key: 'companyType', value: value}))}
                           placeholder="Enter company type"/>
                <TextInput title='Instagram'
                           value={fields.instagramLink}
                           setValue={(value) => dispatch(setField({key: 'instagramLink', value: value}))}
                           placeholder="Enter instagram link"/>
                <TextInput title='Email'
                           value={fields.email}
                           setValue={(value) => dispatch(setField({key: 'email', value: value}))}
                           placeholder="Enter email"/>
                <InputPhone value={fields.phone ?? ''}
                            setValue={(value) => dispatch(setField({key: 'phone', value: value}))}
                            isMenuOpen={isPhoneDropdownOpen}
                            setIsMenuOpen={() => setIsPhoneDropdownOpen(!isPhoneDropdownOpen)}/>
                <TextInput title='Referral code'
                           value={fields.referralCode ?? ''}
                           setValue={(value) => dispatch(setField({key: 'referralCode', value: value}))}
                           placeholder="Enter referral code"/>
                <TextInput title='Password'
                           value={fields.password}
                           setValue={(value) => dispatch(setField({key: 'password', value: value}))}
                           type='password'
                           placeholder="Enter password"/>
                <TextInput title='Repeat password'
                           value={repeatPassword}
                           setValue={(value) => setRepeatPassword(value)}
                           type='password'
                           placeholder="Repeat password"/>
            </div>
            <div className="signup-client__radio">
                <RadioButton content='Agree to Terms and Conditions' size='lg'/>
            </div>
            <div className="signup-client__controls">
                <ButtonMain isDisabled={true} text='Apply now' onClick={handleSignup}/>
            </div>
        </div>
    )
}