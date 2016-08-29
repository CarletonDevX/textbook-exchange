var routeNames = {MAIN:1, SEARCH:2, USER:3, BOOK:4}

exports.set = function (route) {
  return exports.set[route] || (exports.set[route] = function(req, res, next) {

    // Default Meta tags with format property : content
    // Defaults to MAIN
    var metaProps = {
        "fb:app_id"      :  1762840040660077,
        "og:description" : "The streamlined platform for face-to-face textbook transactions with fellow Carls. Buy, sell, lend, and track—all in a sorted and searchable interface.",
        // "og:image"       : "",
        "og:site_name"   : "Carleton Hits the Books",
        "og:title"       : "Carleton Hits the Books",
        "og:type"        : "website",
        "og:url"         : req.hostname+req.originalUrl
    }

    switch(route){
        case routeNames.MAIN:
            // defaults are correct.
            break;
        case routeNames.SEARCH:
            // TODO: Don't cache?
            if (req.query.query) metaProps['og:desc'] = 'Search results for "'+req.query.query+'" on Carleton Hits the Books, the streamlined platform for face-to-face textbook transactions with fellow Carls.'
            metaProps['og:title'] = "Search Results - Carleton Hits the Books";
            metaProps['og:type'] = "product.group";
            break;
        case routeNames.USER:
            // TODO: lookup user name
            metaProps['og:desc'] = "Profile on Carleton Hits the Books, the streamlined platform for face-to-face textbook transactions with fellow Carls."
            metaProps['og:title'] = "Profile - Carleton Hits the Books"
            metaProps['og:type'] = "profile";
            break;
        case routeNames.BOOK:
            // TODO: look up book name
            var metaProps = extend(metaProps);
            metaProps['og:desc'] = "A book on Carleton Hits the Books, the streamlined platform for face-to-face textbook transactions with fellow Carls.";
            metaProps['og:type'] = "books.book";
            // TODO: Lookup book name
            metaProps['og:title'] = "Book - Carleton Hits the Books";
            break;
        default:
            // TODO: log an error here
    }

    req.rMetaProps = metaProps;
    next();
  });
};

exports.routeNames = routeNames