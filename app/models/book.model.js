var Schema = require('mongoose').Schema;

var Book = new Schema({
    ISBN: { type: String, unique: true, index: true },
    name: { type: String, index: true },
    coverImage: String,
    author: [],
    edition: String,
    pageCount: Number,
    publishDate: String,
    publisher: String,
    description: String,
    amazonInfo: {
        id: { type: String, required: true },
        url: { type: String, required: true },
        lastUpdated: { type: Date, required: true },
        numNew: { type: Number, required: true },
        numUsed: { type: Number, required: true },
        sellingPrice: { type: Number },
    },
    lastSearched: Date,
});

// Build indices in case we ever search locally
Book.index({ 
    name: 'text', 
    description: 'text',
});

module.exports = Book;