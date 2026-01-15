import React from "react";
import "./campaign-proposal.scss";
import { Breadcrumbs, Container } from "@/components";
import { ViewChange } from "@/pages/client/components/(proposals,strategy)/view-change";
import { BarOptions } from "./components/bar-options/bar-options";
import { Bar } from "@/pages/client/components/(proposals,strategy)/bar";
import { AddinitonalOption } from "@/pages/client/components/(proposals,strategy)/additional-options";
import { ViewAudience } from "@/pages/client/components/(proposals,strategy)/view-audience";

import { LiveViewCard } from "@/pages/client/components/(proposals,strategy)/live-view";
import { TableProposals } from "./components/table-proposals/table";
interface Props {}

export const CampaignProposals: React.FC<Props> = () => {
  const [options, setOptions] = React.useState<any[]>(["Option"]);
  const [view, setView] = React.useState<number>(1);
  const [changeView, setChangeView] = React.useState<boolean>(false);
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
  const createOption = () => {
    setOptions((prev) => [...prev, "Option"]);
  };
  return (
    <Container className="campaign-proposals">
      <div className="navmenu">
        <Breadcrumbs />
        <ViewChange isProposal={true} setView={setView} view={view} />
      </div>
      <div className="campaign-proposals__title">
        <div className="campaign-proposals__left-side">
          <h2>KOLSCH - Campaign SoundInfluencers</h2>
          <BarOptions options={options} />
        </div>
        <div className="copy">Copy share link </div>
      </div>
      <Bar />
      <div className="addOptions">
        <AddinitonalOption onClick={createOption} />
        <ViewAudience
          onChange={() => setChangeView((prev) => !prev)}
          flag={changeView}
        />
      </div>{" "}
      {view === 0 ? (
        <div className="live-view">
          {mockdata.map((data) => (
            <LiveViewCard data={data} />
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          {" "}
          <TableProposals changeView={changeView} />
        </div>
      )}
    </Container>
  );
};
