import $api from "../../api.ts";
import {encryptAndEncode} from "../../../utils/crypt/crypt.ts";

export const getCampaigns = async (id: string): Promise<any[]> => {
    const result = await $api.get(`/promos/ongoing-campaigns-client?clientId=${encryptAndEncode(id, import.meta.env.VITE_API_ENCRYPTION_SECRET_KEY)}`)
    console.log(result, 'campaigns');
    return ['ddd', 'dsd'];
}