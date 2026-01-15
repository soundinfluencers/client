import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import edit from "@/assets/bar-campaign-strategy/edit-3.svg";

interface LiveViewCardProps {
  data: any;
}

export const LiveViewCard: React.FC<LiveViewCardProps> = ({ data }) => {
  return (
    <div className="live-view__card">
      <div className="live-view__card-video">
        {data.video && <div className="video"></div>}
      </div>

      <div className="live-view__card-fill-data">
        <h3>Post description</h3>
        <div className="fill-input">
          <img src={edit} alt="" />
          <div>
            {data.desciptions.map((t: string, i: number) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="live-view__card-fill-data">
        <h3>Story Tag</h3>
        <div className="fill-input">
          <img src={edit} alt="" />
          {data.storyTags.map((t: string, i: number) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      </div>

      <div className="live-view__card-fill-data">
        <h3>Story Links</h3>
        <div className="fill-input">
          <img src={edit} alt="" />
          {data.StoryLink.map((t: string, i: number) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      </div>

      <div className="live-view__card-fill-data">
        <h3>Audience reach</h3>
        <div className="fill-input-audience">
          {data.AudienceReach.map((t: any, i: number) => (
            <div className="audience" key={i}>
              <img
                src={getSocialMediaIcon(t.socialMedia as SocialMediaType)}
                alt=""
              />
              <p>{t.followers}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="live-view__card-fill-data">
        <h3>Networks</h3>
        <div className="network">
          {data.Networks.map((network: any, i: number) => (
            <div className="network__block" key={i}>
              <p>
                {network.nameNetwork} <span>{network.followers}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
