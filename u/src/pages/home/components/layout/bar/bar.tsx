import React from "react";
import "./_bar.scss";
import { Drafts } from "./actions/drafts";
import { Proposals } from "./actions/proposals";
import { UnderReview } from "./actions/under-review";
import { Distributing } from "./actions/distributing";
import { Completed } from "./actions/completed";
import { SwitchView } from "../../../../../components/ui/switch-view/switch-view";
import { useWindowSize } from "../../../../../hooks/useWindowSize";
interface Props {
  view: number;
  setView: (i: number) => void;
}

export const Bar: React.FC<Props> = ({ view, setView }) => {
  const { width } = useWindowSize();
  return (
    <div className="bar-home">
      <div className="bar-home__title">
        <p>Campaigns</p>{" "}
        {width < 870 && (
          <SwitchView className="base" view={view} setView={setView} />
        )}
      </div>
      <div className="bar-home__content">
        <div className="bar-home__feutures">
          <Drafts />
          <Proposals />
          <UnderReview />
          <Distributing />
          <Completed width={width} />
        </div>
        {width > 870 && (
          <SwitchView className="base" view={view} setView={setView} />
        )}
      </div>
    </div>
  );
};
