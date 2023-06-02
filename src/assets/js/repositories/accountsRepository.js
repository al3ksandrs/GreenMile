import {NetworkManager} from "../framework/utils/networkManager.js";

export class AccountsRepository {
    #networkManager;

    #allAccountsRoute;
    #removeAccountRoute;

    constructor() {
        this.#allAccountsRoute = "/accountsOverview";
        this.#removeAccountRoute =  "/account/delete"

        this.#networkManager = new NetworkManager();
    }

    async loadAllAccounts() {
        return await this.#networkManager.doRequest(this.#allAccountsRoute, "GET");
    }

    removeAccount(accountId) {
        return this.#networkManager.doRequest(this.#removeAccountRoute, "POST", {
            "accountId": accountId
        })
    }
}