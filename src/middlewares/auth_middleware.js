const auth = (req, res, next) => {
  const id = req.headers["x-user-id"];
  const role = req.headers["x-role"];

  if (!id || !role)
    return res.status(401).json({ message: "Unauthorized" });

  req.user = {
    id: Number(id),
    role
  };

  next();
};

const onlySanta = (req, res, next) => {
  if (req.user.role !== "santa")
    return res.status(403).json({ message: "Only Santa allowed" });

  next();
};

export const middleware = {
    auth,
    onlySanta,
}