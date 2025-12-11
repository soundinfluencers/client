import React from "react";
import { Container } from "../../../components/container/container";

interface Props {}

export const AccountSetting: React.FC<Props> = () => {
  const [accountFlag, setAccountFlag] = React.useState<boolean>(false);
  return (
    <Container className="Account-settings">
      <div className="Account-settings__title">
        <h2>Account setting</h2>
      </div>
      <div className="Account-settings__details"></div>
      <div className="Account-settings__invoice"></div>
    </Container>
  );
};
