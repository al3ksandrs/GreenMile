/**
 * Controller class to view all of the items in the roadmap,
 * add new items to the roadmap, delete items from the roadmap
 * and edit items in the roadmap
 * @author beerstj
 */

import {Controller} from "./controller.js";
import {RoadmapRepository} from "../repositories/roadmapRepository.js";

export class submitRoadmapController extends Controller {
    #submitRoadmapView
    #roadmapRepository

    /**
     * Constructor for the class
     */
    constructor() {
        super();
        this.#setupView();
    }

    /**
     * Creates the view for the page, initializes the repository and adds event listeners
     * @returns {Promise<void>}
     * @author beerstj
     */
    async #setupView() {
        this.#submitRoadmapView = await super.loadHtmlIntoContent("html_views/submitRoadmapItem.html")
        this.#roadmapRepository = new RoadmapRepository();

        this.#submitRoadmapView.querySelector("#roadmap-submit").addEventListener("click", () => {
            this.#submitNewRoadmapItem()
        })

        this.#showAllItems()
    }

    /**
     * Gets all of the items from the database and displays these on the page
     * @author beerstj
     */
     #showAllItems() {
        let target = this.#submitRoadmapView.querySelector("#roadmap-table")
        target.innerHTML = ""
        let items =  this.#roadmapRepository.getTimelineValues();
        items.then(function (result) {
            for (let i = 0; i < result.length; i++) {
                target.innerHTML += `
                <tr>
                    <td>`+ result[i].id + `</td>
                    <td>`+ result[i].date.substring(0,10) + `</td>
                    <td>`+ result[i].titel + `</td>
                    <td>`+ result[i].informatie.substring(0,800) + `...</td>
                    <td><button type="button" class="btn btn-danger" id="`+result[i].id+`">Verwijder</button>
                    <button class="btn btn-secondary" type="submit" id="edit`+result[i].id+`">Wijzigen</button></td>
                </tr>
                `
            }
            this.#attachEventListeners()
        }.bind(this))
    }

    /**
     * Attaches the event listeners to all of the delete buttons, one for deleting and one for
     * editing a roadmap item
     * @author beerstj
     */
    #attachEventListeners() {
        let deleteButtonsList = this.#submitRoadmapView.querySelectorAll(".btn-danger")
        let editButtonsList = this.#submitRoadmapView.querySelectorAll(".btn-secondary")
        for (let i = 0; i < deleteButtonsList.length; i++) {
            deleteButtonsList[i].addEventListener("click", () => {
                this.#roadmapRepository.removeItemById(deleteButtonsList[i].id)
                this.#showAllItems()
            })
            editButtonsList[i].addEventListener("click", () => {
                this.#editItem(editButtonsList[i].id.substring(4,7))
            })
        }
    }

    /**
     * Function to edit a roadmap items content and title
     * @param id - ID of which item you want to edit.
     * @author beerstj
     */
    #editItem(id) {
        let modal = this.#submitRoadmapView.querySelector("#change-modal")
        modal.classList.remove("hidden")
        window.scrollTo(0, 0)

        let newTitle = this.#submitRoadmapView.querySelector("#change-roadmap-title")
        let newContent = this.#submitRoadmapView.querySelector("#change-roadmap-content")

        this.#submitRoadmapView.querySelector("#change-roadmap-submit").addEventListener("click", () => {
            this.#roadmapRepository.changeItem(id, newTitle.value, newContent.value)
            modal.classList.add("hidden")
            this.#submitRoadmapView.querySelector("#edit-succes").classList.remove("hidden")
        })

        this.#submitRoadmapView.querySelector("#close-modal").addEventListener("click", () => {
            modal.classList.add("hidden")
        })
    }

    /**
     * This functions adds a new roadmap item to the database.
     * @author beerstj
     */
    #submitNewRoadmapItem() {
        let title = this.#submitRoadmapView.querySelector("#roadmap-title")
        let content = this.#submitRoadmapView.querySelector("#roadmap-content")


        if(title.value.length >= 10 && content.value.length >= 10) {
            this.#roadmapRepository.submitItem(title.value, content.value)
            this.#submitRoadmapView.querySelector("#submit-succes").classList.remove("hidden")
        } else {
            this.#submitRoadmapView.querySelector("#submit-failure").classList.remove("hidden")
        }
    }
}