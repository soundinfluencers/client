import type { IBespokeCampaignTabData } from "@/types/client/form-clients/bespoke-campaign-tabs-data";

import {
  renderInputs,
  renderTextAreas,
} from "../../../../components/form/renderFunctions/input-textAreas";

export function BespokeForm({ data }: { data: IBespokeCampaignTabData }) {
  return (
    <>
      <div className="inputs">
        {data.inputs && renderInputs(data.inputs)}
        {data.textAreas && renderTextAreas(data.textAreas, true)}
      </div>
    </>
  );
}
