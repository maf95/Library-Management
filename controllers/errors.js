exports.get404 = (req, res, next) => {
    let role = "";
    if (req.session.user) {
        role = req.session.user.role;
    }
    res.status(404).render("error/404", {
        pageTitle: "Page not found",
        role: role,
    });
};