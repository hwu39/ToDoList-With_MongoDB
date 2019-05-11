//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-hong:83499658inH#@cluster0-jdbga.mongodb.net/todolistDB", {useNewUrlParser: true});
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true});


const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item",
  itemsSchema
);

const item1 = new Item({
  name: "Welcome to your ToDoList"
});

const item2 = new Item({
  name: "Push + button to add new item"
});

const item3 = new Item({
  name: "<-- Hit this to remove an item"
});

const defaultItems = [item1, item2, item3];

const ListSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", ListSchema);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    //console.log(foundItems);

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved");
        }
      });
      res.redirect("/");
    } else {
      res.render('list', {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
  //res.send();
});

app.get("/:customList", function(req, res) {
  const customListName = _.capitalize(req.params.customList);

  List.findOne({
    name: customListName
  }, function(err, results) {
    if (!err) {
      if (!results) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: results.name,
          newListItems: results.items
        });
      }
    }
  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, results) {
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({
      _id: checkedItemId
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Removed Successfully");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, results) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.post("/work", function(req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.listen(3000, function() {
  console.log();
});
