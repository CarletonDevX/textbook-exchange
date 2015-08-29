// function inject
// Takes takes a collection where we need some more data inserted into each record
// and 1) figures out what data that is, 2) goes and gets it, and 3) inserts in in the
// original record. NOTE: It is very important that you pass a raw object (rather than
// a mongoose document) to inject because mongoose objects refuse to be extended!
//
// mainCollection is the collection we already have
//
// other has form:
// 	REQUIRED collection:  the other collection
// 	REQUIRED ID: 		  the name of the id we're using to grab record
//  REQUIRED localID:     the name of the id on the other collection; usually _id
//  REQUIRED newKey  	  the name the entry will get in the mainCollection objects
// 	OPTIONAL propsNeeded: an array of properties from the other collection objects
//						  that we want. If it's not there we'll copy the whole object over
//
// callback(err, newStuff) is the function to run after we've inserted. If something breaks we return the
// 	err we got and the original mainCollection

exports.inject = function(mainCollection, other, callback) {
	//figure out which items to grab from other.collectionName
	var IDList = {};
	for (var i=0; i<mainCollection.length; i++) {
		var item = mainCollection[i];
		IDList[item[other.ID]] = null; //eg, for each listing for a book, grab the userID
	}

	IDList = Object.keys(IDList) //now a list of userIDs

	//construct the query
	var query = {};
	query[other.localID] = {$in : IDList};

	var response = function(err,res) {
		if (!err){
			//map the response list to a dict for easier searching
			var responseDict = {}
			for (var i=0; i<res.length; i++){
				obj= res[i];
				responseDict[obj[other.localID]] = obj;
			}

			var newCollection = []
			for (var i=0; i<mainCollection.length; i++){
				var item = mainCollection[i];
				item[other.newKey] = responseDict[item[other.ID]];
				newCollection.push(item);
			}
			callback(err, newCollection);
		} else {
			callback(err, mainCollection);
		}
	}

	//switch case on whether props are spec'd
	if (other.propsNeeded) {
		//make sure we hold on to the local id (so that we can match
		//recipient object with object to be inserted)
		var containsLocalID = false;
		for (var i=0;i<other.propsNeeded.length; i++) {
			if (other.propsNeeded[i] == other.localID) {
				containsLocalID = true;
				break;
			}
		}
		if (!containsLocalID) {
			other.propsNeeded.push(other.localID);
		}

		other.collection.find(query, other.propsNeeded.join(' '), response);
	} else { 
		console.log("no req'd params provided");
		other.collection.find(query, response);
	}
}