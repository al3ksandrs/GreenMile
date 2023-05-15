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
    }

    #getAmbitionDatabaseValues() {
        this.#app.get("/timeline", async (req,res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT id, jaar, maand, informatie, titel, date FROM roadmap"
                });

                //just give all data back as json, could also be empty
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch(e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }

    #getNewsletters(){
        this.#app.get("/newsletter", async (req,res)=>{
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT title, content, date, month, year FROM newsletter"
                });

                //just give all data back as json, could also be empty
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch(e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }

    #removeRoadmapById() {
        this.#app.get("/roadmap/delete/:id", async (req,res) => {
            try {
                let results = await this.#databaseHelper.handleQuery({
                    query: "DELETE FROM Roadmap WHERE id= ?",
                    values: [req.params.id]
                });
                res.status(this.#errorCodes.HTTP_OK_CODE).json(results)
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    #submitRoadmap() {
        this.#app.get("/roadmap/submit/title/:title/content/:content", async (req, res) => {
            let months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
            let date = new Date(Date.now())
            try {
                let results = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO Roadmap (jaar, maand, titel, informatie, date)" +
                        "VALUES (?,?,?,?,?)",
                    values: [date.toISOString().substring(0,4), months[date.getMonth()], req.params.title, req.params.content, date]
                })
                res.status(this.#errorCodes.HTTP_OK_CODE).json(results)
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    #changeRoadmapItemById() {
        this.#app.get("/roadmap/id/:id/title/:title/content/:content", async (req, res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "UPDATE roadmap SET titel = ?, informatie = ? WHERE id = ?;",
                    values: [req.params.title, req.params.content, req.params.id]
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data)
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })

    }
}

module.exports = AmbitionRoutes