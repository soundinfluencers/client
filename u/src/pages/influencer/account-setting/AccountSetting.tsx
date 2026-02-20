import { Breadcrumbs, Container } from "@/components";

import './_account-setting.scss';
import { Outlet } from "react-router-dom";

//TODO: all ready (need refactor edit-password-flow) and minor fixes;

export const AccountSetting = () => {

  return (
    <Container className="account-setting-page">
      <Breadcrumbs/>

      <Outlet />
    </Container>
  );
};