class AccountsRoutes {
    #databaseHelper = require("../framework/utils/databaseHelper")
    #errorCodes = require("../framework/utils/httpErrorCodes")

    #app;


    constructor(app) {
        this.#app = app;

        this.#loadAllAccounts();
    }

    #loadAllAccounts() {
        this.#app.get("/accountsOverview", async (req, res) =>{
            try {
                const allAccounts = await this.#databaseHelper.handleQuery({
                    query: "SELECT * FROM Gebruiker"
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(allAccounts);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }
}

module.exports = AccountsRoutes;