var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "",
  database: "bamazon"
});
// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  start();
});

function start() {
	buyProduct();
}

function buyProduct() {
  connection.query("SELECT * FROM products ", function(err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name );
            }
			console.log(choiceArray);
            return choiceArray;
          },
          message: "Choose product index that would you like to buy?"
        },
		
        {
          name: "units",
          type: "input",
          message: "How many Products Unit would you like to buy?"
        }
      ])
      .then(function(answer) {

        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }
		console.log(chosenItem);

        if (chosenItem.stock_quantity >= parseInt(answer.units)) {
			var newstock=chosenItem.stock_quantity - answer.units ;

          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: newstock
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Products order placed successfully!");
              start();
            }
          );
        }
        else {
          console.log("Insuffiecient stock for this product,Try again...");
          start();
        }
      });
  });
}