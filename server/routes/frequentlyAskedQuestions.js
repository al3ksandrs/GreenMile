/**
 * Router files for the frequently asked question page
 * @author Sakhi Anwari
 */

class FrequentlyAskedQuestions {
    #app;

    constructor(app) {
        this.#app = app;

    }
    #createVragen() {
        this.#app.get("/")
    }
}

module.exports = FrequentlyAskedQuestions;
