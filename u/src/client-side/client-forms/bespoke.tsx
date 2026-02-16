import {
  renderInputs,
  renderTextAreas,
} from "@/shared/ui/form/renderFunctions/input-textAreas";
import type { IBespokeCampaignTabData } from "@/types/client/form-clients/bespoke-campaign-tabs-data";

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
