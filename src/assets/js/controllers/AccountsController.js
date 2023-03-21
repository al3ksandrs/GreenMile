import {Controller} from "./controller.js";
import {AccountsRepository} from "../repositories/AccountsRepository.js";

export class AccountsController extends Controller {
    #AccountsView;
    #accountsRepository;

    constructor() {
        super();
        this.#accountsRepository = new AccountsRepository();
        this.#setupView();
        this.#loadAllAccounts();

    }

    async #setupView() {
        this.#AccountsView = await super.loadHtmlIntoContent("html_views/accounts.html")
    }

    async #loadAllAccounts() {
        try {
          const accounts = await this.#accountsRepository.loadAllAccounts();
            for (let i = 0; i < accounts.length; i++) {
                await this.#createAccountCard(accounts[i])
                this.#AccountsView.querySelector("#remove" + accounts[i].id).addEventListener("click", () => {
                    console.log("test")
                })
            }
        } catch(e) {
            console.log(e)
        }
    }

    #createAccountCard(account) {
        let accountsContainer = document.querySelector("#allAccounts")
        let id = account.id;

        let rank;

        switch (account.rang) {
            case 0:
                rank = "Invoerder"
                break;
            case 1:
                rank = "Administrator"
                break;

            default:
                rank = "Onbekend"
                break;
        }

        accountsContainer.innerHTML += `
        <div class="border border-dark col-11 m-2">
            <div class="p fw-bold">Email Adres: ` + account.email + `</div>
            <div class="p fw-bold">Adres: ` + account.huisnummer + account.huisnummerToevoeging + ` ` + account.postcode + `</div>
            <div class="p fw-bold">Registratiedatum: ` + account.registratieDatum.substring(0, 10) + `</div>
            <div class="p fw-bold">Rang: ` + rank + `</div>
            <button id="remove` + id+ `" class="btn-sm btn-secondary btn">Verwijder dit account</button>
        </div>`;
    }
}