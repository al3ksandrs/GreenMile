class AmbitionRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #app

    constructor(app) {
        this.#app = app;

        //call method per route for the rooms entity
        this.#getAmbitionDatabaseValues()
        this.#getNewsletters()
        this.#removeRoadmapById()
        this.#submitRoadmap()
        this.#changeRoadmapItemById()
        this.#getProgressValues()
    }

    /**
     * Endpoint to retrieve values for the roadmap
     * @author kashif
     */
    #getAmbitionDatabaseValues() {
        this.#app.get("/timeline", async (req,res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT id, jaar, maand, informatie, titel, `date` FROM roadmap"
                });

                //just give all data back as json, could also be empty
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch(e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }

    /**
     * retrieves values from newsletter if to use for the roadmap
     * @author kashif
     */
    #getNewsletters(){
        this.#app.get("/timeline/newsletter", async (req,res)=>{
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT title, `date` FROM newsletter"
                });

                //just give all data back as json, could also be empty
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch(e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }
    #getProgressValues(){
        this.#app.get("/timeline/progress", async (req,res)=>{
            try {
                const data = await this.#databaseHelper.handleQuery({
                    //type1 is treegarden 2 is facade
                    query: "SELECT gebied_id, type_id, datum FROM groen"
                });

                //just give all data back as json, could also be empty
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }


    #removeRoadmapById() {
        this.#app.post("/roadmap/delete", async (req,res) => {
            try {
                let results = await this.#databaseHelper.handleQuery({
                    query: "DELETE FROM Roadmap WHERE id= ?",
                    values: [req.body.id]
                });
                res.status(this.#errorCodes.HTTP_OK_CODE).json({status:"succes"})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    #submitRoadmap() {
        this.#app.post("/roadmap/submit", async (req, res) => {
            let months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
            let date = new Date(Date.now())
            try {
                let results = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO Roadmap (jaar, maand, titel, informatie, date)" +
                        "VALUES (?,?,?,?,?)",
                    values: [date.toISOString().substring(0,4), months[date.getMonth()], req.body.title, req.body.content, date]
                })
                res.status(this.#errorCodes.HTTP_OK_CODE).json({status:"succes"})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    #changeRoadmapItemById() {
        this.#app.post("/roadmap/editById", async (req, res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "UPDATE roadmap SET titel = ?, informatie = ? WHERE id = ?;",
                    values: [req.body.title, req.body.content, req.body.id]
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({status:"succes"})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })

    }
}

module.exports = AmbitionRoutes