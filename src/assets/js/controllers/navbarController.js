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

        if (App.sessionManager.get("username")) {
            document.getElementById("newsLetterLogin").innerHTML = `<a class="nav-link" data-controller="submitNewsletter" href="#">Nieuwsbrief invoeren</a>`;
            document.getElementById("dataLogIn").innerHTML = `<a class="nav-link" data-controller="admin" href="#">Data invoeren</a>`;
            document.getElementById("accountLogIn").innerHTML = `<a class="nav-link" data-controller="accounts" href="#">Accounts overview</a>`;
            document.getElementById("registerLogIn").innerHTML = `<a class="nav-link" data-controller="accounts" href="#">Accounts aanmaken</a>`;
            document.getElementById("roadmapLogIn").innerHTML = `<a class="nav-link" data-controller="submitRoadmap" href="#">Roadmap aanpassen</a>`;
            document.getElementById("LogOutStatus").innerHTML = `<a class="nav-link" data-controller="logout" href="#">Logout</a>`;
            document.getElementById("logInStatus").innerHTML = "";
        } else {
            document.getElementById("newsLetterLogin").style.display = "none";
            document.getElementById("dataLogIn").style.display = "none";
            document.getElementById("accountLogIn").style.display = "none";
            document.getElementById("registerLogIn").style.display = "none";
            document.getElementById("roadmapLogIn").style.display = "none";
            document.getElementById("logInStatus").innerHTML = `<a class="nav-link" data-controller="loginsite" href="#">Login</a>`;
            document.getElementById("logOutStatus").innerHTML = "";
        }


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
        event.preventDefault();

        //Get the data-controller from the clicked element (this)
        const clickedAnchor = event.target;
        const controller = clickedAnchor.dataset.controller;

        if (typeof controller === "undefined") {
            console.error("No data-controller attribute defined in anchor HTML tag, don't know which controller to load!")
            return false;
        }

        //TODO: You should add highlighting of correct anchor when page is active :)

        //Pass the action to a new function for further processing
        App.loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }
}
