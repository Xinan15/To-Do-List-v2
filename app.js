//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config();

const app = express();

// --- To store todos into a collection: array
// var items = [];

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

// --- To store todos into mongodb
let dbURL = process.env.SECRET_KEY;
mongoose.connect(dbURL);

// then, to create a new schema
const itemsSchema ={
    name:String
};

// then, to create a model based on the schema
// singular name: Item
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name:"Welcome to your todolist!"
});

const item2 = new Item({
    name:"Hit the + button to add a new item."
});

const item3 = new Item({
    name:"Hit the <-- button to delete an item."
})

const defaultItems = [item1, item2, item3];

// insert all items in one go
// Model.insertMany() no longer accepts a callback

Item.insertMany(defaultItems)
      .then(function () {
        console.log("Successfully saved defult items to DB.");
      })
      .catch(function (err) {
        console.log(err);
      });


app.get("/",function(req,res){

    var today = new Date();

    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    var day = today.toLocaleDateString("en-US", options);
    
    res.render("index",{kindOfDate: day, newListItems: items});
});


app.post("/", function(req,res){
    var item = req.body.newItem;

    items.push(item);

    res.redirect("/");
})

app.listen(3000,function(){
    console.log("Server started on prot 3000");
});