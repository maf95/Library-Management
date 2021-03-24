exports.isAdmin = (req, res, next) => {
    if (!(req.session.isLoggedIn && req.session.user.role === "admin")) {
        return res.redirect("/");
    }
    next();
};

exports.isCorrectUser = (req, res, next) => {
    const userId = req.params.userId;

    if (!(
            req.session.isLoggedIn &&
            req.session.user._id.toString() === userId.toString()
        )) {
        return res.redirect("/");
    }
    next();
};

exports.isLibrarian = (req, res, next) => {
    if (!(req.session.isLoggedIn && req.session.user.role === "librarian")) {
        return res.redirect("/");
    }
    next();
};