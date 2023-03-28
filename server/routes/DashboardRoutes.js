class DashboardRoutes {
    #app
    #httpErrorCodes = require("../framework/utils/httpErrorCodes")
    #errorCodes = require("../framework/utils/httpErrorCodes");
    #databaseHelper = require("../framework/utils/databaseHelper");

    constructor(app) {
        this.#app = app;

        this.#getLKI();
        this.#getTreeAmount();
    }

    /**
     * Gets the current LKI value of the "Stadhouderskade" from the luchtmeetnet API
     * @returns {Promise<void>} - responds the values in JSON-Format
     */
    async #getLKI() {
        this.#app.get("/lki", async (req,res) => {
            try {
                let requestOptions = {
                    method: 'GET',
                    redirect: 'follow'
                };

                let LKIdata;

                await fetch("https://api.luchtmeetnet.nl/open_api/lki?station_number=NL49017&" +
                    "start=" + new Date(Date.now() - 7200001).toISOString() +
                    "&end=" + new Date(Date.now()).toISOString(), requestOptions)
                    .then(function (response) {
                        return response.json();
                    }).then(function (data){
                        LKIdata = data.data[0].value;
                    })

                res.status(this.#httpErrorCodes.HTTP_OK_CODE).json({LKI: LKIdata});

            } catch(e) {

            }
        })
    }

    // get amount of trees for the dashboard (@author Aleksandrs Soskolainens)
    async #getTreeAmount(){
        this.#app.get("/treeAmountRoute", async(req, res) => {

            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "SELECT * FROM groen WHERE type_id = 1;",
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});

            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }
}

module.exports = DashboardRoutes;