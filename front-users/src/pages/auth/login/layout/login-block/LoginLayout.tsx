import {TextInput} from "../../../../../components/ui/inputs/text-input/TextInput.tsx";
import {ButtonMain} from "../../../../../components/ui/buttons/button/Button.tsx";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../../../../../store/store.ts";
import {setEmail, setPassword} from "../../../../../store/slices/features/loginSlice.ts";
import "../../_login-page.scss";
import {type NavigateFunction, useNavigate} from "react-router-dom";

export const LoginLayout = () => {
    const dispatch: AppDispatch = useDispatch();
    const navigate: NavigateFunction = useNavigate();

    const {email, password} = useSelector((state: RootState) => state.login);

    return (
        <div className="login-page">
            <div className="login-page__content">
                <p className="login-page__title">Log in to your Client Dashboard</p>

                <div className="login-page__inputs">
                    <TextInput title="Email" isError={false} value={email}
                               setValue={(value) => dispatch(setEmail(value))}
                               placeholder="Enter email"/>
                    <div className="login-page__password-block">
                        <TextInput title="Password" isError={false} value={password}
                                   setValue={(value) => dispatch(setPassword(value))}
                                   type="password"
                                   placeholder="Enter password"/>
                        <p className="login-page__forgot">Forgot password?</p>
                    </div>
                </div>

                <div className="login-page__controls">
                    <ButtonMain text={"Log in now"} onClick={() => console.log('1')} isDisabled={email.length === 0 || password.length === 0}/>
                </div>
            </div>

            <div className="login-page__footer">
                <p className="login-page__footer--text">Don’t have an account? <a className="login-page__footer--link" onClick={() => navigate('/signup/client')}>Sign up here</a></p>
            </div>
        </div>
    )
}