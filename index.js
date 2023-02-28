const core = require('@actions/core');
const github = require('@actions/github');
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

        for (const file of content.data) {
            const content = await octokit.rest.repos.getContent({
                ...context.repo,
                path: file.path
            });
            const dataFromBase64 = Buffer.from(content.data.content, 'base64').toString()
            //console.log(dataFromBase64)
            const openapi = transpile(JSON.parse(dataFromBase64));
            let openapiBase64 = Buffer.from(JSON.stringify(openapi)).toString('base64');
            octokit.rest.repos.createOrUpdateFileContents({
                ...context.repo,
                path: "postman/schemas/created.yaml",
                message: "modify postman schema",
                content: openapiBase64,
                "committer.name": "action",
                "committer.email": "action@action.com",
                "author.name": "action",
                "author.email": "action@action.com",
                    })
        }

        



        // Returns a JavaScript object representation of the OpenAPI definition.
        //const openapi = transpile(collection);

        //console.log(JSON.stringify(openapi, null, 2));


    } catch (error) {
        console.log(error)
     core.setFailed(error.message);
    }
}