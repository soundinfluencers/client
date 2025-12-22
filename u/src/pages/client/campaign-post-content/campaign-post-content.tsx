import React from "react";
import "./_campaign-post-content.scss";

import { useNavigate } from "react-router-dom";
import {
  Breadcrumbs,
  Container,
  Form,
  SaveDraft,
  SubmtiButton,
} from "../../../components";
import { PlattformsDataForm } from "../../../constants/plattforms-data-form";
import { PlatformForm } from "../../../components/form/client-forms/plattform";
import { Selection } from "./selection/selection-post-content";
interface Props {}

export const CampaignPostContent: React.FC<Props> = () => {
  const navigation = useNavigate();
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
            <Form
              onSubmit={() => console.log("wqeqwe")}
              submitButton={
                <SubmtiButton
                  type="submit"
                  data={`Add additional ${FormData.contentTitle}`}
                />
              }>
              <PlatformForm data={FormData} />
            </Form>
            <div
              onClick={() =>
                navigation("/client/CreateCampaign/Content/Strategy")
              }>
              awdawdaw
            </div>
          </div>
        </div>
        <Selection />
      </div>
    </Container>
  );
};
