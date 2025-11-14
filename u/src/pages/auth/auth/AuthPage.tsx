import {type FC, useState} from "react";
import "./_auth-page.scss";
import {SwitchButton} from "../../../components/ui/switchers/switch-button/SwitchButton.tsx";
import {ButtonMain, ButtonSecondary} from "../../../components/ui/buttons/button/Button.tsx";
import {useNavigate} from "react-router-dom";

export const AuthPage: FC = () => {
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = useState(0);

    const handleSwitchClick = () => {
        if (selectedRole === 0)
            setSelectedRole(1)
        else setSelectedRole(0)
    }

    const handleSignupClick = () => {
        if (selectedRole === 0)
            navigate('/signup/client')
        else
            navigate('signup/influencer')
    }

    return (
        <div className="auth-page__wrapper">
            <div className="auth-page">
                <div className="auth-page__content">
                    <div className="auth-page__title-block">
                        <p className="auth-page__title">Create or access your account</p>
                        <p className="auth-page__subtitle">Choose how you’d like to collaborate with SoundInfluencers</p>
                    </div>

                    <div className='auth-page__form-block'>
                        <div className="auth-page__switch">
                            <SwitchButton firstTitle={'Client'} secondTitle={'Influencer'} activeIndex={selectedRole} onClick={handleSwitchClick}/>
                        </div>

                        <div className="auth-form">
                            <div className="auth-form__header">
                                <p className="auth-form__title">{selectedRole === 0 ? 'I’m a sponsoring client' : 'I’m an influencer'}</p>
                                <p className="auth-form__subtitle">{selectedRole === 0 ? 'Discover top creators and manage your campaigns' : 'Join campaigns and collaborate with leading brands'}</p>
                            </div>
                            <div className="auth-form__controls">
                                <ButtonSecondary text={"Log In"} onClick={() => navigate('/login')}/>
                                <ButtonMain text={"Sign Up"} onClick={handleSignupClick}/>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div className="auth-page__footer">
                <p>Amplify your influence</p>
            </div>
        </div>
    )
}
