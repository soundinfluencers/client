import React from "react";
import "./_campaign-strategy.scss";
import {
  ButtonMain,
  ButtonSecondary,
} from "../../../components/ui/buttons/button/Button";
import {
  Container,
  Breadcrumbs,
  Table,
  Checkbox,
  Modal,
} from "../../../components";
import { BudgetUi } from "./bar-ui/budget";
import { PostsUi } from "./bar-ui/posts";
import { ReachUi } from "./bar-ui/reach";
import { SubmittedUi } from "./bar-ui/submitted";
import { VideoUI } from "./bar-ui/video";
import { ViewAudience } from "./view-audience/view-audience";
import edit from "../../../assets/bar-campaign-strategy/edit-3.svg";
import { useNavigate } from "react-router-dom";
import { boolean } from "zod";
import { getSocialMediaIcon } from "../../../constants/social-medias";
import type { SocialMediaType } from "../../../types/utils/constants.types";
import { LiveViewCard } from "./components/live-view";
interface Props {}

export const CamapignStrategy: React.FC<Props> = () => {
  const mockdata = [
    {
      video: true,
      desciptions: [
        "Post description post description.",
        "Post description post description. ",
      ],
      storyTags: ["@kolschofficia", "@ctellabossi "],
      StoryLink: ["https://ffm.to/joan.lowe.ddd"],
      AudienceReach: [
        {
          socialMedia: "tiktok",
          followers: "414K followers",
        },
        {
          followers: "504K followers",
          socialMedia: "instagram",
        },
      ],
      Networks: [
        {
          nameNetwork: "Techno TV",
          followers: "1.1M",
        },
        {
          nameNetwork: "Techno TV",
          followers: "1.1M",
        },
        {
          nameNetwork: "Techno TV",
          followers: "1.1M",
        },
      ],
    },
    {
      video: true,
      desciptions: [
        "Post description post description.",
        "Post description post description. ",
      ],
      storyTags: ["@kolschofficia", "@ctellabossi "],
      StoryLink: ["https://ffm.to/joan.lowe.ddd"],
      AudienceReach: [
        {
          socialMedia: "tiktok",
          followers: "414K followers",
        },
        {
          followers: "504K followers",
          socialMedia: "instagram",
        },
      ],
      Networks: [
        {
          nameNetwork: "Techno TV",
          followers: "1.1M",
        },
        {
          nameNetwork: "Techno TV",
          followers: "1.1M",
        },
        {
          nameNetwork: "Techno TV",
          followers: "1.1M",
        },
      ],
    },
    {
      video: true,
      desciptions: [
        "Post description post description.",
        "Post description post description. ",
      ],
      storyTags: ["@kolschofficia", "@ctellabossi "],
      StoryLink: ["https://ffm.to/joan.lowe.ddd"],
      AudienceReach: [
        {
          socialMedia: "tiktok",
          followers: "414K followers",
        },
        {
          followers: "504K followers",
          socialMedia: "instagram",
        },
      ],
      Networks: [
        {
          nameNetwork: "Techno TV",
          followers: "1.1M",
        },
        {
          nameNetwork: "Techno TV",
          followers: "1.1M",
        },
        {
          nameNetwork: "Techno TV",
          followers: "1.1M",
        },
      ],
    },
  ];

  const [view, setView] = React.useState<number>(1);

  const arrView = ["Live View", "Edit View"];
  const navigate = useNavigate();
  return (
    <Container className="campaign-strategy">
      <div className="navmenu">
        <Breadcrumbs />
        <div className="changeView">
          <div className="changeView__content">
            {" "}
            {arrView.map((item, i) => (
              <div
                className={`changeView-check ${view === i ? "active" : ""}`}
                onClick={() => setView(i)}>
                {view === i && <div className="dot"></div>}
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>{" "}
      <h1>KOLSCH - Campaign SoundInfluencers</h1>
      <div className="campaign-strategy__bar">
        <SubmittedUi />
        <BudgetUi />
        <ReachUi />
        <PostsUi />
        <VideoUI />
      </div>
      <ViewAudience />
      {view === 0 ? (
        <div className="live-view">
          {mockdata.map((data) => (
            <LiveViewCard data={data} />
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          {" "}
          <Table className="width" />
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
      <Modal
        title={"awdawdawd"}
        onToggle={function (): void {
          throw new Error("Function not implemented.");
        }}>
        <div>wadaddwa</div>
      </Modal>
    </Container>
  );
};
