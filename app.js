//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://tinamallik21:Paramita01@cluster0.ntru3wm.mongodb.net/?retryWrites=true&w=majority&appName=MY_TODOLIST");


const itemSchema = {
  name: String,
}

const Item = mongoose.model("Item", itemSchema);



const item1 = new Item({
  name: "BuyFood",
});
const item2 = new Item({
  name: "Cook Food",
});
const item3 = new Item({
  name: "Eat Food",
});

const newitems = [item1, item2, item3];









const workItems = [];

app.get("/", function (req, res) {




  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(newitems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("succesfully save to database");
        }
      })
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  });
});

app.post("/", function (req, res) {

  const itemname = req.body.newItem;
  const listname = req.body.list;

  const item = new Item({
    name: itemname,
  });

  if (listname === "Today") {
    item.save();
     
    res.redirect("/");
  }
  else{
    List.findOne({name:listname}, function(err,foundList) {
        if(!err){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+foundList.name);
        }
    });
  }


});

app.post("/delete", function (req, res) {

  const checkedItemId=req.body.checkbox;
  const listitem=req.body.listName;

  
  
  if(listitem=="Today"){
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Item deleted successfully");
        res.redirect("/");
      }
    })
    
  }
  else{
    List.findOneAndUpdate({name:listitem},{$pull:{items:{_id:checkedItemId}}},function(err,foundItems){
      if(!err){
        res.redirect("/"+listitem);
      }
    });
  }
  



})


const listSchema = {
  name: String,
  items: [itemSchema],
}

const List = mongoose.model("List", listSchema);

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  const list = new List({
    name: customListName,
    items: newitems,
  })


  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        console.log("List not found");
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        console.log("List already exists");
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  })

})

app.get("/about", function (req, res) {
  res.render("about");
});

// let port = process.env.PORT;

// app.listen(port);

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
