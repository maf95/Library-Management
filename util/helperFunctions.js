const Article = require("../models/article");

exports.createRecord = (data) => {
    try {
        let counter = 0;
        let items = 0;
        data.forEach((item) => {
            counter++;
            items = counter - 1;

            const article = new Article({
                title: item.title,
                typeOfArticle: item.typeOfArticle,
                description: item.description,
                author: item.author,
            });

            if (!article.title ||
                !article.typeOfArticle ||
                !article.description ||
                !article.author
            ) {
                throw new Error(
                    "Invalid data in item number " +
                    counter +
                    ". Only " +
                    items +
                    " records were added to the database."
                );
            }
            article.save();
        });
        return counter;
    } catch (err) {
        throw err;
    }
};