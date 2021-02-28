exports.getIndex = (req, res, next) => {
    res.render("index", { pageTitle: "Welcome to Library" });
};