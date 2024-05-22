const assert = require('assert');
const express = require('express');
const app = express()
app.use(express.json())

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const mongourl = ''; 
const dbName = 'GP';

const bodyParser = require('body-parser');
const session = require('cookie-session');
const SECRETKEY = 'cs381';

var usersinfo = new Array(
    {name: "user1", password: "cs381"},
    {name: "user2", password: "cs381"},
    {name: "user3", password: "cs381"},
    {name: "a", password: "a"},
    {name: 'developer', password: 'developer'},
	{name: 'guest', password: 'guest'},
	{name: 'Oscar', password: 'Oscar'},
	{name: 'admin', password: 'admin'}
);
var Admin = new Array ({name : "Admin", password: "Admin" }
);

const users =[]

var documents = {};
//Main Body
app.set('view engine', 'ejs');
app.use(session({
    userid: "session",  
    keys: [SECRETKEY],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', function(req, res){
    if(!req.session.authenticated){
        console.log("\n...Not authenticated; directing to login...\n");
        res.redirect("/login");
    }else{
    	res.redirect("/login");
    }
    console.log("\n...Hello, welcome back...\n");
});


app.get('/login', function(req, res){
    console.log("\n...Welcome to login page.\n")
    res.sendFile(__dirname + '/public/login.html');
    return res.status(200).render("login");
});

app.post('/login', function(req, res){
    console.log("\n...Handling your login request...\n");
    for (var i=0; i<usersinfo.length; i++){
        if (usersinfo[i].name == req.body.username && usersinfo[i].password == req.body.password) {
        req.session.authenticated = true;
        req.session.userid = usersinfo[i].name;
        console.log(req.session.userid);
        console.log('Success')
        console.log('User logined')
        console.log("\n-----Welcome User------\n")
        return res.status(200).redirect("/home");
        }
    }
        console.log("Error username or password.");
        return res.redirect("/");
});



app.get('/logout', function(req, res){
    req.session = null;
    req.authenticated = false;
    res.redirect('/login');
});


app.get('/singup',function(req,res){
    console.log("\n...Welcome to singup page.\n")
    res.sendFile(__dirname + '/public/singup.html');
    return res.status(200).render("singup")
})

app.post('/singup',function(req,res){
    console.log("\nWelcome to signup page\n")
    console.log("\n.......Creating User.......\n")
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (password !== confirmPassword) {
        res.render('signup', { error: 'Passwords do not match' });
        return;
      }

    const u = { username, password };
    usersinfo.push(u);
    console.log("User created")
    res.redirect('/login');
})


app.get('/home', (req,res) => {
	if (req.session.authenticated){ // we have to make sure the session is authenticated to access the home page.
		console.log("Home Page");
		console.log('Current user: ' + req.session.userid);
		res.status(200).render("home", {name:req.session.userid});
	} else{
		console.log('Not autenticated');
		res.redirect('/');
	}
});


app.get('/Admin/home', function(req, res){
    console.log("...Welcome to the home page!");

    return res.status(200).render("Homep");
});


app.get('/create', (req,res) => {
	if (req.session.authenticated){ // we have to make sure the session is authenticated to access the create page.
		console.log("Create Page");
		console.log('Current user: ' + req.session.userid);
		res.status(200).render("create", {message: null});
	} else{
		console.log('Not autenticated');
		res.redirect('/');
	}
})

app.post('/create', async (req,res) => {
	if(req.session.authenticated){
		console.log(req.body) // make sure the body of client post request has content
		const Gamespec = mongoose.model('gamespec', gamespecSchema);  
		try {	// create a game spec document
			const game = new Gamespec({
				name: req.body.name, 
				os: {minimum: req.body.min_os, recommended: req.body.rec_os},
				processor: {minimum: req.body.min_processor, recommended: req.body.rec_processor},
				memory: {minimum: req.body.min_memory, recommended: req.body.rec_memory},
				graphics: {minimum: req.body.min_graphics, recommended: req.body.rec_graphics},
				storage: {minimum: req.body.min_storage, recommended: req.body.rec_storage},
			});
			const result = await game.save();
			console.log(result)
			console.log('Game Specification Requirement Docs created!');
			res.render('create',{message: 'Successfully Added'});
		} catch (err) {
			console.error(err);
			res.status(400).render('create',{ message: 'Please ensure your entry does not exceed 256 characters or enter the valid number of RAM' });
		}
	} else {
		console.log('Not autheticated');
		res.redirect('/');
	}
})


const findDocument =  function(db, criteria, callback){
    let cursor = db.collection('restaurants').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray(function(err, docs){
        assert.equal(err, null);
        console.log(`findDocument: ${docs.length}`);
        return callback(docs);
    });
}
const createDocument = function(db, createddocuments, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to the MongoDB database server.");
        const db = client.db(dbName);

        db.collection('restaurants').insertOne(createddocuments, function(error, results){
            if(error){
            	throw error
            };
            console.log(results);
            return callback();
        });
    });
}


app.get('/showAll', async (req, res) => {
	if(req.session.authenticated){
        const Gamespec = mongoose.model('gamespec', gamespecSchema);
        try {
            const games = await Gamespec.find({});
            res.render('list', { games: games });
        } catch (err) {
            console.error(err);
            res.status(500).send('An error occurred while fetching the data.');
        }
	} else {
		console.log('Not autheticated');
		res.redirect('/');
	}
});

app.get('/search', async (req, res) => {
	if(req.session.authenticated){
        const Gamespec = mongoose.model('gamespec', gamespecSchema);
        try {
            const games = await Gamespec.find({ name: new RegExp(req.query.name, 'i') });
            res.render('list', { games: games });
        } catch (err) {
            console.error(err);
            res.status(500).send('An error occurred while searching the games.');
        }
	} else {
		console.log('Not autheticated');
		res.redirect('/');
	}
});



app.get('/delete/:id', async (req, res) => { // Delete specific document
	if(req.session.authenticated){
        const Gamespec = mongoose.model('gamespec', gamespecSchema);
        try {
            await Gamespec.findByIdAndRemove(req.params.id);
            res.redirect('/showAll');
        } catch (err) {
            console.error(err);
            res.status(500).send('An error occurred while deleting the game.');
        }
	} else {
		console.log('Not autheticated');
		res.redirect('/');
	}
});

app.post('/update', async (req, res) => {
    const Gamespec = mongoose.model('gamespec', gamespecSchema);
    try {
        const game = await Gamespec.findById(req.body.id);
        game.name = req.body.name;
        game.os.minimum = req.body.min_os;
        game.os.recommended = req.body.rec_os;
        game.processor.minimum = req.body.min_processor;
        game.processor.recommended = req.body.rec_processor;
        game.memory.minimum = req.body.min_memory;
        game.memory.recommended = req.body.rec_memory;
        game.graphics.minimum = req.body.min_graphics;
        game.graphics.recommended = req.body.rec_graphics;
        game.storage.minimum = req.body.min_storage;
        game.storage.recommended = req.body.rec_storage;
        // Update the other properties as needed
        await game.save();
		res.redirect('/showAll')
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while updating the game.');
    }
});


app.listen(8099);
