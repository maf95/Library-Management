const Article = require("../models/article");

exports.createRecord = (data) => {
    data.forEach(async(item) => {
        const article = new Article({
            title: item.title,
            typeOfArticle: item.typeOfArticle,
            description: item.description,
            author: item.author,
        });

        try {
            await article.save();
        } catch (err) {
            throw new Error(err);
        }
    });
};