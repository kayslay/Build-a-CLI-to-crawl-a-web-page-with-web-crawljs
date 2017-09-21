/**
 * Created by kayslay on 6/3/17.
 */
const mongoose = require('mongoose');
const dbConfig = require('../config/db');
//mongoose configs
const Schema = mongoose.Schema;
//creating a schema for the extracted data
const wikiSchema = new Schema({
	title: String,
	body: String,
	references: [String]
});
//connect to mongo db
mongoose.connect(`mongodb://${dbConfig.dbHost}/${dbConfig.dbName}`);
//create the model
const wikiModel = mongoose.model('Wiki', wikiSchema);

//crawl config
module.exports = {
	//the selectors on page we want to select
	//here we are selecting the title, a div with an id of mw-content-text and links with a
	//class name of external and text
	fetchSelector: {title: "title", body: "div#mw-content-text",references: 'a.external.text'},
	//what we want to select from the selector
	//for the title and body we want the text
	//for the references we want to get the href of the links
	fetchSelectBy: {title: "text", body: "text",references:['attr','href']},
	// the same rules apply to the nextSelector and nextSelectBy
	//but this is used to get the links of the page to crawl next
	nextSelector: {links: 'a[href^="/wiki"]'},
	nextSelectBy: {links: ['attr','href']},
	//this changes the next selector when the links match .svg
	dynamicSchemas:{
		nextSelector:[{url:/\.svg/,schema:{links:""}}]
	},
	//formats the url
	formatUrl: function (url) {
		if((/\.svg?/.test(url) || /[A-Z]\w+:\w+?/.test(url))){
			//returning a visited string so that it does not visit the link
			//when the url ends with `.svg` or something like `Wikipedia:About`
			return 'https://en.wikipedia.org/wiki/Web_crawler/'
		}
		return url;
	},
	//what we want to do with the data extracted from the page
	//we want to save it to a mongodb database
	fetchFn: (err, data, url) => {

		if (err) {
			return console.error(err.message);
		}
		let {title, body, references} = data;
		let wikiData = {title: title[0], body: body[0], references};
		wikiModel.create(wikiData, function (err, wiki) {
			console.log(`page with a title ${wiki.title}, has been saved to the database`);
		});
	},
	//called at the end of the whole crawl
	finalFn: function () {
		console.log('finished crawling wiki');
	},
	depth: 3, //how deep the crawl should go
	limitNextLinks: 10,// limit the amount of links we get from wikipedia to 10. this helps when you dont want to get all the links
	urls: ['https://en.wikipedia.org/wiki/Web_crawler/'] //the default urls to crawl if one is not specified
};