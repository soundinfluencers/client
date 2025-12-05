import React from "react";
import "./_campaign-post-content.scss";
import Form from "../../../components/form/form";
import { PlattformsDataForm } from "../../../constants/plattforms-data-form";
import { Container } from "../../../components/container/container";
import { Selection } from "./selection/selection-post-content";
interface Props {}

export const CampaignPostContent: React.FC<Props> = () => {
  const plattform = "press";
  const FormData = PlattformsDataForm.find(
    (data) => data.plattform === plattform
  );
  if (!FormData) return <p>Платформа не найдена</p>;
  return (
    <Container className="campaign-post-content">
      {" "}
      <div className="form-block">
        <div className="form-block__header"></div>
        <Form className={"postContent"} data={FormData} />
      </div>
      <Selection />
    </Container>
  );
};
