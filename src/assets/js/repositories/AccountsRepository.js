import {NetworkManager} from "../framework/utils/networkManager.js";

export class AccountsRepository {
    #networkManager;

    #allAccountsRoute;

    constructor() {
        this.#allAccountsRoute = "/accountsOverview";

        this.#networkManager = new NetworkManager();
    }

    loadAllAccounts() {
        return this.#networkManager.doRequest(this.#allAccountsRoute, "GET");
    }
}