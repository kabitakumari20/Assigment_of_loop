const mongoose = require("mongoose");

class Database {
    constructor() {
        this.db_connect();
    }
    async db_connect() {
        try {
            this.database = await mongoose.connect("mongodb://127.0.0.1:27017/assignment", {
                useNewUrlParser: true,
                // useUnifiedTopology: true
            });
            console.log("Database connection successful");
            mongoose.set('debug', true);
        
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = new Database();
