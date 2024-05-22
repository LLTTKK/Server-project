const mdb = require('mongoose')

const gameSpecSchema = mdb.Schema(
    {
        name: {type :String, maxLength: 128, required : [true, "Please enter the name"]},
        os:{
            minimum: {type :String, maxLength: 32, required : [true, "Please enter the Minimum OS requirememt"]},
            recommended: {type :String, maxLength: 32, required : [true, "Ether tge recommended OS requirement"]}
        },
        processor :{
            minimum: {type :String, maxLength: 32, required : [true, "Please enter the Minimum processor requirement"]},
            recommended: {type :String, maxLength: 32, required : [true, "Ether tge recommended processor requirement"]}
        },
        memory:{
            minimum: {type :Number, maxLength: 32, required : [true, "Please enter the Minimum memory need"]},
            recommended: {type :Number, maxLength: 32, required : [true, "Ether tge recommended memory requirement"]}
        },
        graphics: {
            minimum: {type :String, maxLength: 64, required : [true, "Please enter the Minimum graphics setup"]},
            recommended: {type :String, maxLength: 64, required : [true, "Ether tge recommended graphics requirement"]}
        },
        storage:{
            minimum: {type :Number, required : [true, "Please enter the Minimum storage requirememt"]},
            recommended: {type :Number, required : [true, "Ether tge recommended storage requirement"]}
        }

    }
)