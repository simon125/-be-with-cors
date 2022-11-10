const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Users API",
      version: "1.0.0",
      descritpion: "API",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
      {
        url: "http://localhost:3005",
      },
      {
        url: "https://fine-pear-cow-tux.cyclic.app",
      },
    ],
  },
  apis: ["./index.js"],
};

const specs = swaggerJsDoc(options);

const generateId = () => Math.random().toString(36).substring(2, 15);

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());
app.use(cors());

// Apply the rate limiting middleware to API calls only
app.use("/users", apiLimiter);

let PSEUDO_DB = [
  { id: generateId(), name: "John", age: 23 },
  { id: generateId(), name: "Jane", age: 13 },
  { id: generateId(), name: "Joe", age: 33 },
  { id: generateId(), name: "Jack", age: 45 },
];

const PSEUDO_DB_COPY = [...PSEUDO_DB];

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - age
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: name of the user
 *         age:
 *           type: number
 *           description: age of the user
 *       example:
 *         id: d5fE_asz
 *         name: Jane
 *         age: 23
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users API
 *
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns the list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of the Users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

app.get("/users", (req, res) => {
  res.status(200).json({ users: PSEUDO_DB });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Returns the user specified by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 */

app.get("/users/:id", (req, res) => {
  try {
    if (!PSEUDO_DB.find((user) => user.id === req.params.id)) {
      res.status(404).json({ message: "user doesn't exist" });
    }

    res.status(200).json({ users: PSEUDO_DB });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

/**
 * @swagger
 * /users:
 *  post:
 *    summary: Create new user
 *    tags: [Users]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      201:
 *        description: The user was created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      400:
 *        description: User probably exists
 */

app.post("/users", (req, res) => {
  try {
    const newUser = {
      id: generateId(),
      name: req.body.name,
      age: req.body.age,
    };

    if (!!PSEUDO_DB.find((user) => user.name === req.body.name)) {
      res.status(400).json({ message: "user already exists" });
    }

    PSEUDO_DB.push(newUser);

    res.status(201).json({ message: "user has been created" });
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Removes user from the list
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user was deleted
 *       404:
 *         description: The user was not found
 */
app.delete("/users/:id", (req, res) => {
  try {
    const idToDelete = req.params.id;

    const userExists = PSEUDO_DB.find((user) => user.id === idToDelete);

    if (userExists) {
      PSEUDO_DB = PSEUDO_DB.filter((user) => user.id !== idToDelete);

      res.status(200).json({ message: "user deleted" });
    } else {
      res.status(400).json({ message: "user not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

/**
 * @swagger
 * /users/{id}:
 *  patch:
 *    summary: Update the user by the id
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The user id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: The user was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      404:
 *        description: The user was not found
 */

app.patch("/users/:id", (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

/**
 * @swagger
 * /restart:
 *  get:
 *    summary: Reset database
 *    responses:
 *      200:
 *        description: The DB was restart
 */

app.get("/restart", (req, res) => {
  PSEUDO_DB = PSEUDO_DB_COPY;
  res.status(200).json({ message: "Done" });
});

/**
 * @swagger
 * /error:
 *  get:
 *    summary: If you're not able to get 500 error to see it for your own try to hit this endpoint
 *    responses:
 *      500:
 *        description: Artificial error
 */
app.get("/error", (req, res) => {
  return res.status(500).send("error");
});

app.listen(process.env.PORT || 4000, () => console.log("app is running"));
