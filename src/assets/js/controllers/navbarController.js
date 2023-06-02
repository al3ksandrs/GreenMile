/**
 * Responsible for handling the actions happening on the navigation
 *
 * @author Lennard Fonteijn & Pim Meijer
 */

import {App} from "../app.js";
import {Controller} from "./controller.js";

export class NavbarController extends Controller {
    #navbarView

    constructor() {
        super();
        this.#setupView();
    }

    /**
     * Loads contents of desired HTML file into the index.html .navigation div
     * @returns {Promise<void>}
     * @private
     */
    async #setupView() {
        //await for when HTML is
        this.#navbarView = await super.loadHtmlIntoNavigation("html_views/navbar.html")

        this.#changeNavBarBasedOnLogin()

        //from here we can safely get elements from the view via the right getter
        const anchors = this.#navbarView.querySelectorAll("a.nav-link");

        //set click listener on each anchor
        anchors.forEach(anchor => anchor.addEventListener("click", (event) => this.#handleClickNavigationItem(event)))
    }

    /**
     * Reads data attribute on each .nav-link and then when clicked navigates to specific controller
     * @param event - clicked anchor event
     * @returns {boolean} - to prevent reloading
     * @private
     */
    #handleClickNavigationItem(event) {
        event.preventDefault()

        //Get the data-controller from the clicked element (this)
        const clickedAnchor = event.target;
        const controller = clickedAnchor.dataset.controller;

        if (typeof controller === "undefined") {
            console.error("No data-controller attribute defined in anchor HTML tag, don't know which controller to load!")
            return false;
        }
        //TODO: You should add highlighting of correct anchor when page is active :)

        this.#changeNavBarBasedOnLogin()

        //Pass the action to a new function for further processing
        App.loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }

    /**
     * @author
     * Changes the navbar based on wether the user is logged in or not. If logged in text "Log in" changes to "Uitloggen". App.isLoggedIn Refers to app.js for checking if a session is found or not.
     * When the session is found the CSS code display:hidden is removed and all navbar items show up.
     */
    #changeNavBarBasedOnLogin() {
        App.isLoggedIn(() => {
            console.log("Status: Logged in.")
            this.#navbarView.querySelector("#loggedIn").innerText = "Uitloggen"

            let navAnchors = this.#navbarView.querySelectorAll(".nav-item")
            for (let i = 0; i < navAnchors.length; i++) {
                if(i >= 5) {
                    navAnchors[i].classList.remove("hidden")
                }
            }

        }, () => {
            console.log("Status: Not logged in.")
            this.#navbarView.querySelector("#loggedIn").innerText = "Inloggen"

            let navAnchors = this.#navbarView.querySelectorAll(".nav-item")
            for (let i = 0; i < navAnchors.length; i++) {
                if(i >= 5) {
                    navAnchors[i].classList.add("hidden")
                }
            }
        })
    }
}
