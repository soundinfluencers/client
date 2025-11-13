import type {FC} from "react";
import "./_forgot_password_page.scss";
import {TextInput} from "../../../components/ui/inputs/text-input/TextInput.tsx";
import {useDispatch, useSelector} from "react-redux";
import type {RootState} from "../../../store/store.ts";
import {setEmail} from "../../../store/slices/features/loginSlice.ts";
import {ButtonMain} from "../../../components/ui/buttons/button/Button.tsx";

export const ForgotPasswordPage: FC = () => {
    const dispatch = useDispatch();
    const {email} = useSelector((state: RootState) => state.login);

    return (
        <div className='forgot-password-page'>
            <div className='forgot-password-page__title-block'>
                <p className='forgot-password-page__title'>Reset your password</p>
                <p className='forgot-password-page__subtitle'>Enter your email address below and we’ll send you a link
                    to reset your password</p>
            </div>
            <div className='forgot-password-page__input'>
                <TextInput value={email}
                           setValue={(value) => dispatch(setEmail(value))}
                           isError={false}
                           placeholder='Enter email'
                           title='Email'/>
            </div>
            <div className='forgot-password-page__controls'>
                <ButtonMain text='Send reset link' onClick={() => console.log('1')} isDisabled={true}/>
            </div>
        </div>
    )
}