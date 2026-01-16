import React from "react";
import "./_campaign-strategy.scss";

import { useLocation, useNavigate } from "react-router-dom";
import {
  Breadcrumbs,
  ButtonMain,
  ButtonSecondary,
  Checkbox,
  Container,
} from "@/components";
import { ViewChange } from "@/pages/client/components/(proposals,strategy)/view-change";
import { Bar } from "@/pages/client/components/(proposals,strategy)/bar";
import { LiveViewCard } from "@/pages/client/components/(proposals,strategy)/live-view";
import { ViewAudience } from "@/pages/client/components/(proposals,strategy)/view-audience";

import { TableStrategy } from "./components/table-strategy/table";
import { useSelectedSocials } from "@/hooks/client/useSelectedSocials";
import { mockdata } from "@/constants/client/campaign-strategy.data";
import { useCampaignStore } from "@/store/client/createCampaign";
import { useResetCampaignOnLeave } from "./hooks/useCampaignLeave";

interface Props {}

export const CamapignStrategy: React.FC<Props> = () => {
  useResetCampaignOnLeave();
  const { postContent, campaignName, actions } = useCampaignStore();

  const [changeView, setChangeView] = React.useState<boolean>(false);
  const [view, setView] = React.useState<number>(1);
  const navigate = useNavigate();
  console.log("postContent", postContent);

  const main = postContent.main;
  const music = postContent.music;
  console.log("main", main);
  console.log("music", music);

  return (
    <Container className="campaign-strategy">
      <div className="navmenu">
        <Breadcrumbs />
        <ViewChange setView={setView} view={view} />
      </div>{" "}
      <h1>{campaignName || ""} - Campaign SoundInfluencers</h1>
      <Bar />
      {view === 1 && (
        <ViewAudience
          flag={changeView}
          onChange={() => setChangeView((prev) => !prev)}
        />
      )}
      {view === 0 ? (
        <div className="live-view-campaign">
          {mockdata.map((data) => (
            <LiveViewCard data={data} />
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          {" "}
          {music.length >= 1 && (
            <TableStrategy
              isMusic={true}
              changeView={changeView}
              items={music}
            />
          )}{" "}
          {main.length >= 1 && (
            <TableStrategy changeView={changeView} items={main} />
          )}
        </div>
      )}
      <Checkbox name="Allow automatic influencer replacement if a creator opts out." />
      <div className="campaign-strategy__options">
        <ButtonSecondary
          text={"Save as proposal"}
          onClick={function (): void {
            throw new Error("Function not implemented.");
          }}
          className="btn"
        />{" "}
        <ButtonSecondary
          text={"Save Draft"}
          onClick={function (): void {
            throw new Error("Function not implemented.");
          }}
          className="btn"
        />
      </div>
      <div className="campaign-strategy__proceedTo">
        <ButtonMain
          text={"Proceed to payment"}
          onClick={() =>
            navigate("/client/CreateCampaign/Content/Strategy/Payment")
          }
          className="proceedTo"
        />
      </div>
    </Container>
  );
};
