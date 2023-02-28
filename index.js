const core = require('@actions/core');
const github = require('@actions/github');
const collection = require('./collection'); // any Postman collection JSON file
const { transpile } = require('postman2openapi');


run();

async function run() {

    try {
        const myToken = core.getInput('myToken');
        const context = github.context
        const octokit = github.getOctokit(myToken)

        const content = await octokit.rest.repos.getContent({
            ...context.repo,
            path: 'postman/collections'
        });

        console.log(content)



        // Returns a JavaScript object representation of the OpenAPI definition.
        //const openapi = transpile(collection);

        //console.log(JSON.stringify(openapi, null, 2));


    } catch (error) {
     core.setFailed(error.message);
    }
}