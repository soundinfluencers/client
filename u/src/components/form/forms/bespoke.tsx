import type { IBespokeCampaignTabData } from "../../../types/form/bespoke-campaign-tabs-data";

import {
  renderInputs,
  renderTextAreas,
} from "../renderFunctions/input-textAreas";

export function BespokeForm({
  data,
  register,
  errors,
}: {
  data: IBespokeCampaignTabData;
  register: any;
  errors: any;
}) {
  return (
    <>
      <div className="inputs">
        {data.inputs && renderInputs(data.inputs, register, errors)}
        {data.textAreas && renderTextAreas(data.textAreas, register, errors)}
      </div>
    </>
  );
}
