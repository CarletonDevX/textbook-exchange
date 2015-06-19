exports.render = function(req, res) {
    res.render('index', {
        "title": "Textbook Exchange",
        "desc": "Get ur textbooks 4 free"
    })
};