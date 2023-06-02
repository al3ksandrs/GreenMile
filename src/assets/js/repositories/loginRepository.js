/**
 * Repository responsible for all user data from server - CRUD
 * Make sure all functions are using the async keyword when interacting with network!
 *
 * @author Pim Meijer & Sakhi Anwari
 */

import { NetworkManager } from "../framework/utils/networkManager.js";

export class LoginRepository {
    //# is a private field in Javascript
    #route
    #networkManager

    constructor() {
        this.#route = "/loginSite/createLogin";
        this.#networkManager = new NetworkManager();
    }

    async getAll() {

    }

    /**
     * Async function that sends username and password to network manager which will send it to our back-end to see
     * if a user is found with these credentials
     *
     * POST request, so send data as an object which will be added to the body of the request by the network manager
     * @param email
     * @param password
     * @returns {Promise<user>}
     */
    async createLogin(email, password) {
        return await this.#networkManager
            .doRequest(`${this.#route}`, "POST", {"email": email, "password": password});
    }

    async delete() {

    }

    //example endpoint would be: /users/register
    async register(username, password) {

    }

    async update(id, values = {}) {

    }
}
