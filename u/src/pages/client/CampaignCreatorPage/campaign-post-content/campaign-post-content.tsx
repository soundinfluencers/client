import React from "react";
import "./_campaign-post-content.scss";
import Form from "../../../../components/form/form";
import { PlattformsDataForm } from "../../../../constants/plattforms-data-form";
import { Container } from "../../../../components/container/container";
import { Selection } from "./selection/selection-post-content";
import { Breadcrumbs } from "../../../../components/ui/Breadcrumbs/pathnames";
import { SaveDraft } from "../../../../components/save-draft/save-draft";
interface Props {}

export const CampaignPostContent: React.FC<Props> = () => {
  const plattform = "press";
  const FormData = PlattformsDataForm.find(
    (data) => data.plattform === plattform
  );
  if (!FormData) return <p>PLattorm is not found</p>;
  return (
    <Container className="campaign-post-content">
      <Breadcrumbs />
      <div className="campaign-post-content__row">
        <div className="form-block">
          <div className="form-block__sticky">
            {" "}
            <div className="form-block__header">
              <h1>Review this content</h1>
              <SaveDraft />
            </div>
            <Form className={"postContent"} data={FormData} />
          </div>
        </div>
        <Selection />
      </div>
    </Container>
  );
};
