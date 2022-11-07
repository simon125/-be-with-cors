const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();

const generateId = () => Math.random().toString(36).substring(2, 15);

const app = express();
app.use(express.json());
app.use(cors());

let PSEUDO_DB = [
  { id: generateId(), name: "John", age: 23 },
  { id: generateId(), name: "Jane", age: 13 },
  { id: generateId(), name: "Joe", age: 33 },
  { id: generateId(), name: "Jack", age: 45 },
];

const PSEUDO_DB_COPY = [...PSEUDO_DB];

app.get("/users", (req, res) => {
  res.status(200).json({ users: PSEUDO_DB });
});

app.delete("/users/:id", (req, res) => {
  const idToDelete = req.params.id;

  const userExists = PSEUDO_DB.find((user) => user.id === idToDelete);

  if (userExists) {
    PSEUDO_DB = PSEUDO_DB.filter((user) => user.id !== idToDelete);

    res.status(200).json({ message: "user deleted" });
  } else {
    res.status(404).json({ message: "user not found" });
  }
});

app.post("/users", (req, res) => {
  const newUser = {
    id: generateId(),
    name: req.body.name,
    age: req.body.age,
  };

  PSEUDO_DB.push(newUser);

  res.status(201).json({ message: "user has been created" });
});

app.patch("/users/:id", (req, res) => {
  const idToUpdate = req.params.id;

  const userExists = PSEUDO_DB.find((user) => user.id === idToUpdate);

  if (userExists) {
    PSEUDO_DB = PSEUDO_DB.map((user) =>
      user.id === idToUpdate ? { ...user, ...req.body } : user
    );

    res.status(200).json({ message: "user has been updated" });
  } else {
    res.status(404).json({ message: "user not found" });
  }
});

app.get("/restart", (req, res) => {
  PSEUDO_DB = PSEUDO_DB_COPY;
  res.status(200).json({ message: "Done" });
});

app.listen(process.env.PORT, () => console.log("app is running"));
