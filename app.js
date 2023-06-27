//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//Lodash
const _ = require("lodash");
require("dotenv").config();

const app = express();

// --- To store todos into a collection: array
// var items = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// --- To store todos into mongodb
let dbURL = process.env.SECRET_KEY;
mongoose.connect(dbURL);

// then, to create a new schema
const itemsSchema = {
  name: String,
};

// then, to create a model based on the schema
// singular name: Item
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "Hit the <-- button to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Model.find() and Model.insertMany() no longer accepts a callback function


app.get("/", async function(req, res) {
  try {
    const foundItems = await Item.find({});

    if (foundItems.length === 0) {
      try {
        await Item.insertMany(defaultItems);
        console.log("Successfully saved default items to DB.");
      } catch(err) {
        console.log(err);
      }
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  } catch(err) {
    console.log(err);
  }
});


app.get("/:customListName", async function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  try {
    const foundList = await List.findOne({name: customListName});

    if (!foundList) {
      // Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      try {
        await list.save();
      } catch (err) {
        console.log(err);
      }

      res.redirect("/" + customListName);
    } else {
      // Show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  } catch(err) {
    console.log(err);
  }
});

app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    try {
      await item.save();
      res.redirect("/");
    } catch(err) {
      console.log(err);
    }
  } else {
    try {
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      await foundList.save();
      res.redirect("/" + listName);
    } catch(err) {
      console.log(err);
    }
  }
});

app.post("/delete", async function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    try {
      await Item.findByIdAndRemove(checkedItemId);
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    } catch(err) {
      console.log(err);
    }
  } else {
    try {
      await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
      res.redirect("/" + listName);
    } catch(err) {
      console.log(err);
    }
  }
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});