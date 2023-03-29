class DashboardRoutes {
    #app
    #errorCodes = require("../framework/utils/httpErrorCodes");
    #databaseHelper = require("../framework/utils/databaseHelper");

    constructor(app) {
        this.#app = app;

        this.#getLKI();
        this.#getTreeAmount();
        this.#getTemp();
        this.#getGroen();
        this.#getGevel();
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
                const fetch = require("node-fetch");

                await fetch("https://api.luchtmeetnet.nl/open_api/lki?station_number=NL49017&" +
                    "start=" + new Date(Date.now() - 7200001).toISOString() +
                    "&end=" + new Date(Date.now()).toISOString(), requestOptions)
                    .then(function (response) {
                        return response.json();
                    }).then(function (data){
                        LKIdata = data.data[0].value;
                    })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({LKI: LKIdata});

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

    async #getTemp() {
        this.#app.get("/fineDust", async (req, res) => {
            try {
                let requestOptions = {
                    method: 'GET',
                    redirect: 'follow',
                };

                let fineDustData;
                const fetch = require("node-fetch");

                await fetch("https://api.luchtmeetnet.nl/open_api/measurements?" +
                    "start=" + new Date(Date.now() - 7200000).toISOString() +
                    "&end=" + new Date(Date.now()).toISOString() +
                    "&station_number=NL49017&formula=PM25&page=1&order_by=timestamp_measured&order_direction=desc", requestOptions)
                    .then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        fineDustData = data.data[0].value
                    })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({fineDust: fineDustData});

            } catch (e) {
                console.log(e)
            }
        });
    }
    async #getGroen() {
        this.#app.get("/groen", async(req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT SUM(groeneM2) AS GroenM2 FROM gebied"
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});

            } catch (e) {

                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    async #getGevel(){
        this.#app.get("/gevel", async(req, res) => {

            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "SELECT * FROM groen WHERE type_id = 2;",
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});

            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }
}

module.exports = DashboardRoutes;