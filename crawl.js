#!/usr/bin/env node
/**
 * Created by kayslay on 5/31/17.
 */
const crawler = require('web-crawljs');
const program = require('commander');

//commander configuration
function list(val) {
    "use strict";
    return val.split(',');
}

program
    .option('-x --execute <string>', 'the configurtion to execute')
    .option('-d --depth [number]', 'the depth of the crawl')
    .option('-u --urls [items]', 'change the urls',list)
    .parse(process.argv);

//throw an error if the execute flag is not used
if (!program.execute) {
    throw new Error('the configuration to use must be set use the -x flag to define configuration;' +
        ' use the --help for help')
}
//holds the additional configuration that will be added to crawlConfig
const additionalConfig = {};

//set the object that will override the default crawlConfig
(function (config) {
    //depth
    if (program.depth) config['depth'] = program.depth;
    if(!!program.urls) config['urls'] = program.urls

})(additionalConfig);

//the action is the file name that holds the crawlConfig
let action = program.execute;


try {
    //set the crawlConfig
    let crawlConfig = Object.assign(require(`./config/${action}`), additionalConfig);
    const Crawler = crawler(crawlConfig);
    Crawler.CrawlAllUrl()
} catch (err) {
    console.error(`An Error occurred: ${err.message}`);
}
