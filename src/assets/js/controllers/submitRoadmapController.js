/**
 * Controller class to view all of the items in the roadmap,
 * add new items to the roadmap, delete items from the roadmap
 * and edit items in the roadmap
 */

import {Controller} from "./controller.js";
import {AmbitionRepository} from "../repositories/AmbitionRepository.js";

export class submitRoadmapController extends Controller {
    #submitRoadmapView
    #roadmapRepository

    constructor() {
        super();
        this.#setupView();
    }

    /**
     * Creates the view for the page, initializes the repository and adds event listeners
     * @returns {Promise<void>}
     */
    async #setupView() {
        this.#submitRoadmapView = await super.loadHtmlIntoContent("html_views/submitRoadmapItem.html")
        this.#roadmapRepository = new AmbitionRepository();

        this.#submitRoadmapView.querySelector("#roadmap-submit").addEventListener("click", () => {
            this.#submitNewRoadmapItem()
        })

        this.#showAllItems()
    }

    /**
     * Gets all of the items from the database and displays these on the page
     */
     #showAllItems() {
        let target = this.#submitRoadmapView.querySelector("#roadmap-table")
        target.innerHTML = ""
        let items =  this.#roadmapRepository.getTimelineValues();
        items.then(function (result) {
            for (let i = 0; i < result.length; i++) {
                let id = result[i].id
                target.innerHTML += `
                <tr>
                    <td>`+ id + `</td>
                    <td>`+ result[i].date.substring(0,10) + `</td>
                    <td>`+ result[i].titel + `</td>
                    <td>`+ result[i].informatie.substring(0,800) + `...</td>
                    <td><button type="button" class="btn btn-danger" id="`+id`">Verwijder</button></td>
                </tr>
                `
            }
            this.#attachEventListeners()
        }.bind(this))
    }

    /**
     * Attaches the event listeners to all of the delete buttons, one for deleting and one for
     * editing a roadmap item
     */
    #attachEventListeners() {
        let deleteButtonsList = this.#submitRoadmapView.querySelectorAll("button")
        for (let i = 0; i < deleteButtonsList.length; i++) {
            deleteButtonsList[i].addEventListener("click", () => {
                this.#roadmapRepository.removeItemById(deleteButtonsList[i].id)
                this.#showAllItems()
            })
        }
    }

    /**
     * This functions adds a new roadmap item to the database.
     */
    #submitNewRoadmapItem() {
        let title = this.#submitRoadmapView.querySelector("#roadmap-title")
        let content = this.#submitRoadmapView.querySelector("#roadmap-content")
        this.#roadmapRepository.submitItem(title, content)
    }
}