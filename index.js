import http from "http";
import fs from "fs/promises";

async function getContactsFromDB() {
  const _json = await fs.readFile("./db/contacts.json", { encoding: "utf-8" });
  return JSON.parse(_json);
}

async function writeContactsToDB(contacts) {
  fs.writeFile("./db/contacts.json", contacts);
}

const serverOfContactsApp = http.createServer(async (req, res) => {
  let contacts = await getContactsFromDB();
  // console.log(req.url);

  let [, api, endPoint, id] = req.url.split("/");
  res.writeHead(200, "Ok!", {
    "Content-Type": "application/json",
  });
  // console.log(req.method);

  if (req.url.startsWith("/api") && endPoint === "contacts") {
    switch (req.method) {
      case "GET":
        if (id && !isNaN(id)) {
          return res.end(
            JSON.stringify(contacts.find((contact) => contact.id == id + ""))
          );
        }

        return res.end(JSON.stringify(contacts));

      case "POST":
        try {
          req.on("data", (chunk) => {
            const newContact = JSON.parse(chunk.toString());
            contacts.push(newContact);
            writeContactsToDB(JSON.stringify(contacts));
            return res
              .writeHead(200, "Created!")
              .end("Contact has been created");
          });
        } catch (error) {
          return res
            .writeHead(500, "Sorry smth has wfwgwgwgw!")
            .end("Server Error!");
        }
        break;

      case "PUT":
        try {
          if (id && !isNaN(id)) {
            req.on("data", (chunk) => {
              const editedContact = JSON.parse(chunk.toString());
              contacts = contacts.map((contact) => {
                if (contact.id == id + "") {
                  return editedContact;
                }
                return contact;
              });
            });
            writeContactsToDB(JSON.stringify(contacts));
            return res.writeHead(201, "edited!").end("Contact has been edited");
          } else {
            throw new Error("Id is not provided");
          }
        } catch (error) {
          return res
            .writeHead(500, "Sorry smth has happened!")
            .end(error.message ?? "Server Error!");
        }
        break;

      case "DELETE":
        try {
          if (id && !isNaN(id)) {
            contacts = contacts.filter((contact) => contact.id != id);
            writeContactsToDB(JSON.stringify(contacts));
            return res
              .writeHead(200, "deleted!")
              .end("Contact has been deleted");
          } else {
            throw new Error("ID is not provided");
          }
        } catch (error) {
          return res
            .writeHead(500, "Sorry smth has happened!")
            .end(error.message ?? "Server Error!");
        }
        break;

      default:
        return res.writeHead(404, "method not supported!");
    }
  } else {
    return res.writeHead(404, "endpoint not found!");
  }
});

serverOfContactsApp.listen(8080);
