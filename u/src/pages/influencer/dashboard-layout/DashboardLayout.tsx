import { Container } from "@/components";
import { HistoryLink } from "./components/campaign-history-link/HistoryLink";
import { InvoiceLink } from "./components/create-invoice-link/InvoiceLink";
import { DashboardHero } from "./components/dashboard-hero/DashboardHero";
import { PromosFiltersBar } from "./components/promo-filters-bar/PromosFiltersBar";
import { ViewModeTabs } from "./components/promos-view-mode-tab/ViewModeTabs";
import { Navigate, Outlet, useMatch } from "react-router-dom";
import { HomePageLink } from "./components/home-page-link/HomePageLink";

import "./_dashboard-layout.scss";
// import { toast } from "react-toastify";
// import { useEffect } from "react";
import { useUser } from "@/store/get-user";
// import { useAuth } from "@/contexts/AuthContext.tsx";
// import { useState } from "react";
// import { toast } from "react-toastify";
// import { Modal } from "@components/ui/modal-fix/Modal.tsx";


export const DashboardLayout = () => {
  const { user } = useUser();
  // const { accessToken } = useAuth();
  const isDashboard = useMatch("/influencer");
  const isPromos = useMatch("/influencer/promos");
  const isHistory = useMatch("/influencer/campaign-history");
  // const [isModalOpen, setIsModalOpen] = useState(false);

  // useEffect(() => {
  //   // if (user?.needAgreementRedirect);
  //       toast.info(<WelcomeToast />)
  // }, []);

  if (user?.verifiedStatus === "waitForUser") {
    console.log({"Redirecting to agreement page due to needAgreementRedirect flag after login": user?.needAgreementRedirect});
    return <Navigate to={`profile/agreement`} replace />
  }

  return (
    <Container className="dashboard">
      <div className="dashboard__hero-wrapper">
        <DashboardHero />
        <div className="dashboard__hero-links">
          {(isPromos || isDashboard) && <HistoryLink />}
          {isHistory && <HomePageLink />}
          <InvoiceLink />
        </div>
      </div>

      <div className="dashboard__top-bar">
        <h3 className="dashboard__top-bar-title">Promos</h3>
        <div className="dashboard__top-bar-actions">
          {(isPromos || isDashboard) && (
            <>
                <PromosFiltersBar />
                <ViewModeTabs />
            </>
          )}
        </div>
      </div>
      <Outlet />
    </Container>
  );
};



// const WelcomeToast = () => {
//   return (
//     <div>
//       <p>
//         Welcome to your dashboard!
//         Here you can manage promotions and invoices.
//       </p>
//
//       <Link to="/influencer/social-accounts" className="toast-link"
//         style={{
//           textDecoration: "underline",
//           color: "red",
//         }}
//       >
//         Open
//       </Link>
//     </div>
//   )
// };
//
// export const Agreement = () => {
//
//   return (
//     <Container className="agreement-page">
//       <div className="agreement-page__wrapper">
//         <div className="agreement-page__header">
//           <h1 className="agreement-page__title">Congratulations</h1>
//           {/*<p className="agreement-page__subtitle">*/}
//           {/*  {agreementMessages[agreementType]?.subtitle || 'Your agreement details are ready.'}*/}
//           {/*</p>*/}
//         </div>
//
//         <div className="agreement-page__content">
//           <h2 className="agreement-page__content-title">Here’s what you’ll earn</h2>
//
//           {/*<ul className="agreement-page__benefits-list">*/}
//           {/*  {accountList.map(({ socialMedia, username, price }) => (*/}
//           {/*    <li className="agreement-page__benefits-item" key={`${socialMedia}:${username}`}>*/}
//           {/*      <div className="agreement-page__benefits-social">*/}
//           {/*        <img*/}
//           {/*          src={getSocialIcon(socialMedia) ?? ''}*/}
//           {/*          alt={socialMedia}*/}
//           {/*        />*/}
//           {/*        <p>{username}</p>*/}
//           {/*      </div>*/}
//           {/*      <p className="agreement-page__benefits-info">*/}
//           {/*        {`${price}\u20AC ${getArticle(socialMedia)}`}*/}
//           {/*      </p>*/}
//           {/*    </li>*/}
//           {/*  ))}*/}
//           {/*</ul>*/}
//
//           <div className="agreement-page__info">
//             <h2 className="agreement-page__earnings">{`Estimated total earnings:`}</h2>
//             <div className="agreement-page__conformation">
//               <h3 className="agreement-page__conformation-title"></h3>
//               <div className="agreement-page__conformation-actions">
//
//                 {/*<ButtonMain*/}
//                 {/*  label={isMutatePending ? 'Processing...' : 'Yes'}*/}
//                 {/*  isDisabled={isMutatePending}*/}
//                 {/*  onClick={async () => {*/}
//                 {/*    const res = await mutateAsync({ status: "accept", agreementType, influencerId: influencerId ?? undefined });*/}
//                 {/*    console.log('Account creation accepted', res);*/}
//                 {/*    setAccessToken(res.accessToken);*/}
//                 {/*    const userData = await getMe();*/}
//                 {/*    setUser(userData);*/}
//                 {/*    navigate("/", { replace: true });*/}
//                 {/*  }}*/}
//                 {/*/>*/}
//                 {/*<ButtonSecondary*/}
//                 {/*  label={isMutatePending ? 'Processing...' : 'No'}*/}
//                 {/*  isDisabled={isMutatePending}*/}
//                 {/*  onClick={() => {*/}
//                 {/*    const res = mutateAsync({ influencerId: influencerId ?? '', action: 'decline' });*/}
//                 {/*    console.log('Account creation declined', res);*/}
//                 {/*    navigate("/auth", { replace: true });*/}
//                 {/*  }}*/}
//                 {/*/>*/}
//
//                 {/*<a*/}
//                 {/*  href={buildMailto('admin@soundinfluencers.com')}*/}
//                 {/*  target="_blank"*/}
//                 {/*  rel="noopener noreferrer"*/}
//                 {/*  // style={{ textDecoration: "underline", color: "black" }}*/}
//                 {/*  className="agreement-page__conformation-contact"*/}
//                 {/*  // onClick={(e) => {*/}
//                 {/*  //   // Prevent default mailto behavior to ensure it works across all browsers*/}
//                 {/*  //   e.preventDefault();*/}
//                 {/*  //   if (e.defaultPrevented) {*/}
//                 {/*  //     window.location.href = buildMailto('admin@soundinfluencers.com');*/}
//                 {/*  //   }*/}
//                 {/*  //   // console.log("mailto click", { defaultPrevented: e.defaultPrevented });*/}
//                 {/*  // }}*/}
//                 {/*>*/}
//                 {/*  No, Review Details*/}
//                 {/*</a>*/}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <span className="agreement-page__terms">
//             By clicking Yes, you confirm and approve the rates listed above and agree to our{'\n'}
//         <a
//           href="/terms/influencer"
//           target="_blank"
//           rel="noopener noreferrer"
//           style={{ textDecoration: "underline", color: "black" }}
//         >
//              Terms & Conditions.
//         </a>
//       </span>
//     </Container>
//   );
// };
