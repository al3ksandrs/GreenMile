class demoRoutes {

    #errorCodes = require("../framework/utils/httpErrorCodes")

    #app;

    constructor(app) {
        this.#app = app;
        this.#endPoint
    }

    #endPoint() {
        this.#app.get("/mijnNaam/:naam", async (req, res) => {
        
            res.status(this.#errorCodes.HTTP_OK_CODE).json(req.params.naam);

        });

        this.#app.get("/mijnNaam/", async (req, res) => {
        
            res.status(this.#errorCodes.HTTP_OK_CODE).json("Anouar");

        });

    }
    
}

module.exports = demoRoutes;