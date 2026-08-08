const express = require("express");
const morgan = require("morgan");

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(express.json());

app.use(express.static("public"));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use((req, res, next) => {
    console.log("Hello from the middleware");
    next();
});


app.get("/test", (req, res) => {
    res.json({ message: "Server is working" });
});


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


app.use(globalErrorHandler);

module.exports = app;