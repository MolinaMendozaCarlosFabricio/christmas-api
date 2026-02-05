import express from "express";
import cors from "cors";
import kids_router from "./src/routes/kids_routes.js";
import wishes_router from "./src/routes/wishes_routes.js";

const app = express();

app.use(cors({ "origin": "*" }));
app.use(express.json());

app.use("/users", kids_router);
app.use("/wishes", wishes_router);

app.listen(3000, () => {
  console.log("Christmas API running on port 3000");
});
