// import React from "react";
// import menu from "@/assets/icons/menu.svg";
// import grid from "@/assets/icons/grid.svg";
// import "./switch-view.scss";
//
// interface Props {
//   view: number;
//   setView: (i: number) => void;
//   className?: string;
// }
//
// export const SwitchView: React.FC<Props> = ({ view, setView, className }) => {
//   const arrView = [menu, grid];
//
//   return (
//     <div className={`changeView ${className ?? ""}`}>
//       <div className="changeView__content">
//         {arrView.map((icon, i) => (
//           <div
//             key={i}
//             className={`changeView-check ${view === i ? "active" : ""}`}
//             onClick={() => setView(i)}>
//             <img src={icon} alt="" />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
import React from "react";
import menu from "@/assets/icons/menu.svg";
import grid from "@/assets/icons/grid.svg";
import "./switch-view.scss";
import type {CampaignListViewMode} from "@/client-side/types/common.ts";


interface Props {
    view: CampaignListViewMode;
    setView: (view: CampaignListViewMode) => void;
    className?: string;
}

const VIEW_ITEMS: Array<{ key: CampaignListViewMode; icon: string }> = [
    { key: "table", icon: menu },
    { key: "grid", icon: grid },
];

export const SwitchView: React.FC<Props> = ({ view, setView, className }) => {
    return (
        <div className={`changeView ${className ?? ""}`}>
            <div className="changeView__content">
                {VIEW_ITEMS.map((item) => (
                    <div
                        key={item.key}
                        className={`changeView-check ${view === item.key ? "active" : ""}`}
                        onClick={() => setView(item.key)}
                    >
                        <img src={item.icon} alt="" />
                    </div>
                ))}
            </div>
        </div>
    );
};