/**
 * This class contains ExpressJS routes specific for the users entity
 * this file is automatically loaded in app.js
 *
 * route file for admin
 */

class adminRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes");
    #databaseHelper = require("../framework/utils/databaseHelper");
    #app;

    constructor(app) {
        this.#app = app;

        this.#addGreenType();
    }

    #addGreenType() {

        this.#app.get("/admin", async(req, res) => {

            res.status(this.#errorCodes.HTTP_OK_CODE).json("");
        });


        this.#app.post("/admin", async(req, res) => {

            const type = req.body.type;

            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "INSERT INTO type(naam) VALUES (?)",
                    values: [type]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);

            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }

        });
    }

}

module.exports = adminRoutes