/**
 *
 * 1= administrator, 2=student and everything else is unknown.
 */


class UsersRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #cryptoHelper = require("../framework/utils/cryptoHelper");
    #app

    /**
     * @param app -
     */
    constructor(app) {
        this.#app = app;

        //call method per route for the users entity
        this.#login()
    }

    /**
     * Checks if passed username and password are found in db, if so let the front-end know
     * @private
     */
    #login() {
        this.#app.post("/loginSite/createLogin", async (req, res) => {
            const email = req.body.email;

            const password = req.body.password;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT email, wachtwoord FROM gebruiker WHERE email = ? AND wachtwoord = ?",
                    values: [email, password]
                });

                //if we founnd one record we know the user exists in users table
                if (data.length === 1) {
                    //return just the username for now, never send password back!
                    res.status(this.#errorCodes.HTTP_OK_CODE).json({"username": data[0].email});
                } else {
                    //wrong username
                    res.status(this.#errorCodes.AUTHORIZATION_ERROR_CODE).json({reason: "Wrong username or password"});
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }
}

module.exports = UsersRoutes