exports.getIndex = (req, res, next) => {
    res.render("index", { pageTitle: "Welcome to Library" });
};

exports.getLogin = (req,res,next)=>{
    res.render('login',{pageTitle:"Login"})
}

exports.getAdmin = (req,res,next)=>{
    res.render('admin',{pageTitle:"Admin's page"})
}

exports.getLibrarian=(req,res,next)=>{
    res.render('librarian',{pageTitle:"Librarian's page"})
}

exports.getNewUser = (req,res,next)=>{
    res.render('new-user',{pageTitle:'Add new user'})
}

exports.getNewArticle=(req,res,next)=>{
    res.render('new-article',{pageTitle:'Add new article'})
}