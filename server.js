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

  if (endPoint === "/lists" && method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    // read json file and return all lists
    fs.readFile("./lists.json", "utf8", (err, jsonString) => {
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

    fs.readFile("./lists.json", "utf8", (err, jsonString) => {
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
            console.log(body);
          });

        // let updatedLists = JSON.stringify(lists);
        // //write to json
        // fs.writeFile("./lists.json", updatedLists, (err) => {
        //   if (err) {
        //     res.end("Error writing file", err);
        //   } else {
        //     res.end("Successfully wrote file");
        //   }
        // });
      } catch (err) {
        console.error(err);
        res.end();
      }
    });
    //post data to json file
  }
  if (endPoint === "/lists/:listId" && method === "GET") {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
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

server.listen(3000, "localhost", () => {
  console.log("listening for requests on port 3000");
});
