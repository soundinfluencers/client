import {$auth} from "@/api/api.ts";

export async function createClientAccountApi(data: any): Promise<void> {
    console.log("Start create client account with data:", data);

    await $auth.post("/auth/create/client", data);

    console.log("Create client account request sent successfully");
}