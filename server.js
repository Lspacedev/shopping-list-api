const http = require("node:http");
const fs = require("fs");
const { url } = require("inspector");
const { v4: uuidv4 } = require("uuid");
const busboy = require("busboy");
const path = require("path");
const folderPath = "./storage";
fs.access(folderPath, (error) => {
  if (error) {
    fs.mkdir(folderPath, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Storage folder created successfully!");
        let createStream = fs.createWriteStream("storage/lists.json");
        createStream.write("[]");
        createStream.end();
      }
    });
  } else {
    console.log("Folder already exists!");
  }
});
const imagesPath = "./image-uploads";
fs.access(imagesPath, (error) => {
  if (error) {
    fs.mkdir(imagesPath, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Images folder created successfully!");
      }
    });
  } else {
    console.log("Folder already exists!");
  }
});

const server = http.createServer((req, res) => {
  let endPoint = req.url;
  let method = req.method;
  //sub routes
  let subRoutes = req.url.split("/");
  let listId = subRoutes[2];

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
  } else if (endPoint === "/lists" && method === "POST") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    fs.readFile("./storage/lists.json", "utf8", (err, jsonString) => {
      if (err) {
        console.error(err);
        res.end();
      }
      try {
        let id = uuidv4();
        let imgPath = "";

        const bb = busboy({ headers: req.headers });

        bb.on("file", (name, file, info) => {
          let extension = info.filename.substring(
            info.filename.indexOf(".") + 1
          );
          let imgName = `${id}-upload-${uuidv4()}.${extension}`;
          const saveTo = path.join("image-uploads", imgName);
          imgPath = imgName;

          file.pipe(fs.createWriteStream(saveTo));
        });
        bb.on("close", () => {
          res.writeHead(200, { Connection: "close" });
        });

        req.pipe(bb);
        let lists = JSON.parse(jsonString);

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
            if (imgPath !== "") {
              obj.img = imgPath;
            }
            obj.id = id;

            lists.push(obj);

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
      } catch (err) {
        res.end(err.message);
      }
    });
  } else if (typeof listId !== "undefined" && method === "GET") {
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
  } else if (typeof listId !== "undefined" && method === "PUT") {
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
            let imgPath = "";
            const bb = busboy({ headers: req.headers });
            bb.on("file", (name, file, info) => {
              if (info.mimeType.includes("image")) {
                let extension = info.filename.substring(
                  info.filename.indexOf(".") + 1
                );
                //get image name from obj
                let imgName = list.img;
                if (typeof imgName === "undefined") {
                  imgName = `${list.id}-upload-${uuidv4()}.${extension}`;
                }
                const saveTo = path.join("image-uploads", imgName);
                imgPath = imgName;
                file.pipe(fs.createWriteStream(saveTo));
              }
            });
            bb.on("close", () => {
              res.writeHead(200, { Connection: "close" });
            });

            req.pipe(bb);
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

                if (imgPath !== "") {
                  list.img = imgPath;
                }
                let updatedLists = JSON.stringify(lists);
                //write to json
                fs.writeFile("./storage/lists.json", updatedLists, (err) => {
                  if (err) {
                    console.error("Error writing file", err);
                    res.end();
                  } else {
                    res.end("Successfully updated data");
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
  } else if (typeof listId !== "undefined" && method === "DELETE") {
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
            let [deletedList] = lists.filter((list) => list.id === listId);
            let filteredLists = lists.filter((list) => list.id !== listId);
            let updatedLists = JSON.stringify(filteredLists);
            //write to json
            fs.writeFile("./storage/lists.json", updatedLists, (err) => {
              if (err) {
                console.error("Error writing file", err);
                res.end();
              } else {
                if (typeof deletedList.img !== "undefined") {
                  fs.unlink(`./image-uploads/${deletedList.img}`, (err) => {
                    if (err) {
                      console.error(err);
                      return;
                    }
                  });
                }

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
  } else {
    res.end("Invalid route");
  }
});
function getInputValue(str) {
  let val = str.replace(/[^a-z0-9-]/gi, ",");
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
  });
  return obj;
}
function parseFormData(str) {
  let val = str.split("\r\n");

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
