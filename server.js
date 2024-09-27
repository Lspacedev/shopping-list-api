const http = require("node:http");
const fs = require("fs");
const { url } = require("inspector");
const { v4: uuidv4 } = require("uuid");
// GET    /lists
// POST   /lists
// GET    /lists/:listId
// UPDATE /lists/:listId/update
// DELETE /lists/:listId/delete

const server = http.createServer((req, res) => {
  let endPoint = req.url;
  let method = req.method;

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
    // console.log("REQ FILES", req);
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
            let val;
            let obj = {};
            console.log({ body });
            if (body.includes("Content-Disposition")) {
              obj = parseFormData(body);
              console.log(obj);
            } else {
              val = getInputValue(body);
              obj = arrayToObject(val);
            }
            obj.id = uuidv4();
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
  //sub routes
  let subRoutes = req.url.split("/");
  let listId = subRoutes[2];
  console.log(listId);
  if (typeof listId !== "undefined" && method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    //read json file and return specific list using id
    fs.readFile("./storage/lists.json", "utf8", (err, jsonString) => {
      if (err) {
        console.error(err);
        res.end();
      }
      try {
        let lists = JSON.parse(jsonString);
        let [list] = lists.filter((list) => list.id === listId);
        console.log({ list });
        if (typeof list !== "undefined") {
          if (JSON.stringify(list) !== "{}") {
            res.end(JSON.stringify(list));
          }
        } else {
          res.end("List not found");
        }
      } catch (err) {
        console.error(err);
        res.end();
      }
    });
  }

  if (typeof listId !== "undefined" && method === "PUT") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    //read json file and return specific list using id
    fs.readFile("./storage/lists.json", "utf8", (err, jsonString) => {
      if (err) {
        console.error(err);
        res.end();
      }
      try {
        let lists = JSON.parse(jsonString);
        let list = lists.find((list) => list.id === listId);

        if (typeof list !== "undefined") {
          if (JSON.stringify(list) !== "{}") {
            let body = "";
            req
              .on("data", (data) => {
                body += data;
              })
              .on("end", () => {
                let val;
                let obj = {};
                if (body.includes("Content-Disposition")) {
                  obj = parseFormData(body);
                } else {
                  val = getInputValue(body);
                  obj = arrayToObject(val);
                }
                if (typeof obj.listName !== "undefined") {
                  list.listName = obj.listName;
                }
                if (typeof obj.category !== "undefined") {
                  list.category = obj.category;
                }
                if (typeof obj.quantity !== "undefined") {
                  list.quantity = obj.quantity;
                }
                let updatedLists = JSON.stringify(lists);
                //write to json
                fs.writeFile("./storage/lists.json", updatedLists, (err) => {
                  if (err) {
                    console.error("Error writing file", err);
                    res.end();
                  } else {
                    res.end("Successfully added data");
                  }
                });
              });
          }
        } else {
          res.end("List not found");
        }
      } catch (err) {
        console.error(err);
        res.end();
      }
    });
  }

  if (typeof listId !== "undefined" && method === "DELETE") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    //read json file and return specific list using id
    fs.readFile("./storage/lists.json", "utf8", (err, jsonString) => {
      if (err) {
        console.error(err);
        res.end();
      }
      try {
        let lists = JSON.parse(jsonString);
        let list = lists.filter((list) => list.id === listId);

        if (typeof list !== "undefined") {
          if (JSON.stringify(list) !== "{}") {
            let filteredLists = lists.filter((list) => list.id !== listId);
            let updatedLists = JSON.stringify(filteredLists);
            //write to json
            fs.writeFile("./storage/lists.json", updatedLists, (err) => {
              if (err) {
                console.error("Error writing file", err);
                res.end();
              } else {
                res.end("Successfully deleted data");
              }
            });
          }
        } else {
          res.end("List not found");
        }
      } catch (err) {
        console.error(err);
        res.end();
      }
    });
  }
});
function getInputValue(str) {
  let val = str.replace(/[^a-z0-9-]/gi, ",");
  //console.log(val);
  return val.split(",");
}
function arrayToObject(arr) {
  let obj = {};

  arr.forEach((element, i) => {
    if (element === "listName") {
      obj.listName = arr[i + 1];
    }
    if (element === "category") {
      obj.category = arr[i + 1];
    }
    if (element === "quantity") {
      obj.quantity = arr[i + 1];
    }
    if (element.includes("img")) {
    
      let part1 = arr[i + 2];
      let part2 = arr[i + 3];
      let part3 = arr[i + 4];
     let imgs = part1 + part2;
      var buf = new Buffer.from(imgs, 'binary');
     var blob = new Blob([buf], { type: "image/png" });
    
  fs.writeFile('image.png', buf, (err)=>console.log(err));
  obj.img = 'data:image/png;base64,' + btoa(blob);
  let base64Image = 'data:image/png;base64,' + Buffer.from(imgs).toString('base64');


    }
  });
  return obj;
}
function parseFormData(str) {
  let val = str.split("\r\n");
  console.log({ val });
  //get img

  val = val.filter((valStr) => !valStr.match(/^-/gi));

  val = val.filter((valStr) => valStr !== "");

  val = val.map((valStr) => {
    if (valStr.includes("Content")) {
      let str = valStr.substring(valStr.indexOf("=") + 1);
      str = str.substring(1, str.length - 1);
      return str;
    }
    return valStr;
  });

  let obj = arrayToObject(val);
  return obj;
}
server.listen(3000, "localhost", () => {
  console.log("listening for requests on port 3000");
});
