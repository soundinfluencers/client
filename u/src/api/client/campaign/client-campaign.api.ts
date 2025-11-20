import $api from "../../api.ts";
import {encryptAndEncode} from "../../../utils/crypt/crypt.ts";

export const getCampaigns = async (): Promise<any[]> => {
    try {
        console.log('Sending request to /promos/client/get/list');
        const result = await $api.get(`/promos/client/get/list`);
        console.log('Success:', result.data);
        return result.data;
    } catch (error: any) {
        console.error('Error fetching campaigns:', error);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        throw error;
    }
}