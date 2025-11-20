import {type FC} from "react";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch, RootState} from "../../../store/store.ts";
import {type NavigateFunction, useNavigate} from "react-router-dom";
import {TextInput} from "../../../components/ui/inputs/text-input/TextInput.tsx";
import {setEmail, setPassword} from "../../../store/slices/features/loginSlice.ts";
import {ButtonMain} from "../../../components/ui/buttons/button/Button.tsx";
import './_login-page.scss';
import {useAuth} from "../../../contexts/AuthContext.tsx";
import {loginApi} from "../../../api/auth/auth.api.ts";
import type {ResponseLoginUserModel} from "../../../types/auth/auth.types.ts";

export const LoginPage: FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const navigate: NavigateFunction = useNavigate();

    const {email, password} = useSelector((state: RootState) => state.login);
    const {setAccessToken} = useAuth();

    const handleLogin = async () => {
        const res: ResponseLoginUserModel = await loginApi({email, password});

        if (res.accessToken && res.userRole) {
            setAccessToken(res.accessToken);
            navigate('/client/home')
        }
    }

    return (
        <div className="login-page__wrapper">
            <div className="login-page">
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
                        <p className="login-page__forgot" onClick={() => navigate("/forgot-password")}>Forgot
                            password?</p>
                    </div>
                </div>

                <div className="login-page__controls">
                    <ButtonMain text={"Log in now"} onClick={handleLogin}
                                isDisabled={email.length === 0 || password.length === 0}/>
                </div>
            </div>
            <div className="login-page__footer">
                <p className="login-page__footer--text">Don’t have an account? <a className="login-page__footer--link"
                                                                                  onClick={() => navigate('/signup/client')}>Sign
                    up here</a></p>
            </div>
        </div>
    )
}