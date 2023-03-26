class nieuwsbriefRoutes {
    #app
    #databaseHelper = require("../framework/utils/databaseHelper")
    #errorCodes = require("../framework/utils/httpErrorCodes")

    constructor(app) {
        this.#app = app;

        this.#singUp();
    }

    #singUp() {
        this.#app.get("/mailingList/signup/:email", async (req,res) => {
            try {
                const results = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO mailing_list (email) VALUES (?)",
                    values: [req.params.email]
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json(results)
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e})
            }
        })
    }
}

module.exports = nieuwsbriefRoutes;