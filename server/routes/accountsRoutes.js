class AccountsRoutes {
    #databaseHelper = require("../framework/utils/databaseHelper")
    #errorCodes = require("../framework/utils/httpErrorCodes")

    #app;

    constructor(app) {
        this.#app = app;

        this.#loadAllAccounts();
        this.#removeAccount();
    }

    /**
     * Removes an account based on the ID provided in the parameters of the request
     * @author chanicy
     */
    #removeAccount() {
        this.#app.post("/account/delete", async (req,res) => {
            try {
                let results = await this.#databaseHelper.handleQuery({
                    query: "DELETE FROM Gebruiker WHERE id= ?",
                    values: [req.params.id]
                });
                res.status(this.#errorCodes.HTTP_OK_CODE).json({status: "Succes"})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    /**
     * Endpoint to retrieve all the users from the database,
     * when it gets all the accounts, it returns all of it in JSON-Format
     * @author chanicy
     */
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