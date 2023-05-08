class AmbitionRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #app

    constructor(app) {
        this.#app = app;

        //call method per route for the rooms entity
        this.#getAmbitionDatabaseValues()
    }

    #getAmbitionDatabaseValues() {
        this.#app.get("/timeline", async (req,res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT jaar, maand, informatie FROM roadmap"
                });

                //just give all data back as json, could also be empty
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch(e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }






}

module.exports = AmbitionRoutes