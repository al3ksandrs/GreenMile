/**
 * Router file for registering an account and puttinng it in the database
 * @author Sakhi Anwari
 */

class registerRoute {

    #app;
    #databaseHelper = require("../framework/utils/databaseHelper")
    #httpErrorCodes = require("../framework/utils/httpErrorCodes")

    constructor(app) {
        this.#app = app;
        this.#register();
    }

    #register() {
        this.#app.post("/register", async (req, res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO gebruiker (rang, email, password, registratieDatum) VALUES (?, ?, ?, ?)",
                    values: [req.body.rang, req.body.email, req.body.password, req.body.registratieDatum]
                });

                if (data.insertId) {
                    res.status(this.#httpErrorCodes.HTTP_OK_CODE).json({id: data.insertId});
                }

            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }
}

module.exports = registerRoute;
