class DashboardRoutes {
    #app
    #httpErrorCodes = require("../framework/utils/httpErrorCodes")

    constructor(app) {
        this.#app = app;

        this.#getLKI();
    }

    /**
     * Gets the current LKI value of the "Stadhouderskade"
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

                await fetch("https://api.luchtmeetnet.nl/open_api/lki?station_number=NL49017&start=" + new Date(Date.now() - 7200001).toISOString() + "&end=" + new Date(Date.now()).toISOString(), requestOptions)
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
}

module.exports = DashboardRoutes;