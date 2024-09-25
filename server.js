const http = require("http");
const fs = require("fs");
// GET    /lists
// POST   /lists
// GET    /lists/:listId
// UPDATE /lists/:listId/update
// DELETE /lists/:listId/delete

const server = http.createServer((req, res) => {
  let endPoint = req.url;
  let method = req.method;
  console.log(req);
  if (endPoint === "/lists" && method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    // read json file and return all lists
    fs.readFile("./storage/lists.json", "utf8", (err, jsonString) => {
      if (err) {
        console.error(err);
        res.end();
      }
      res.end(jsonString);
    });
  }
  if (endPoint === "/lists" && method === "POST") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    fs.readFile("./storage/lists.json", "utf8", (err, jsonString) => {
      if (err) {
        console.error(err);
        res.end();
      }
      try {
        let lists = JSON.parse(jsonString);

        let body = "";
        req
          .on("data", (data) => {
            body += data;
          })
          .on("end", () => {
            let val = getInputValue(body);
            let obj = arrayToObject(val);

            lists.push(obj);

            let updatedLists = JSON.stringify(lists);
            //write to json
            fs.writeFile("./storage/lists.json", updatedLists, (err) => {
              if (err) {
                console.error("Error writing file", err);
                res.end();
              } else {
                console.log("Successfully added data");
                res.end();
              }
            });
          });
      } catch (err) {
        console.error(err);
        res.end();
      }
    });
  }
  if (endPoint === "/lists/:listId" && method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    console.log(req);
    //use params to get list id
    //read json file and return specific list

    res.end();
  }
  if (endPoint === "/lists/:listId" && method === "PUT") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    //use params to get list id
    //update json file and return specific list

    res.end();
  }
  if (endPoint === "/lists/:listId" && method === "DELETE") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    //use params to get list id
    //delete json file and return specific list

    res.end();
  }
  // res.write(JSON.stringify(countries));
  // res.end();
});
function getInputValue(str) {
  let val = str.replace(/[^a-z0-9-]/gi, ",");
  return val.split(",");
}
function arrayToObject(arr) {
  let obj = {};
  arr.forEach((element, i) => {
    if (element === "itemName") {
      obj.itemName = arr[i + 1];
    }
    if (element === "category") {
      obj.category = arr[i + 1];
    }
    if (element === "quantity") {
      obj.quantity = arr[i + 1];
    }
  });
  return obj;
}
server.listen(3000, "localhost", () => {
  console.log("listening for requests on port 3000");
});
