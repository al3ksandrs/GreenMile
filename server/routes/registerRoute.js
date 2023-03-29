/**
 * Router file voor het bijhouden van registraties aan de database
 * @author Anouar Tarahbi
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
            const username = req.body.username;
            const password = req.body.password;
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO users(username, password) VALUES (?, ?)",
                    values: [username, password]
                });
            

                if(data.insertId) {
                    res.status(this.#httpErrorCodes.HTTP_OK_CODE).json({id: data.insertId});
                } 

        } catch(e) {
            res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e})
        }
    });
}

}

module.exports = registerRoute;
