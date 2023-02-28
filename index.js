const core = require('@actions/core');
const github = require('@actions/github');
const { transpile } = require('postman2openapi');
const yaml = require('js-yaml');


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
            const specificFileContent = await octokit.rest.repos.getContent({
                ...context.repo,
                path: file.path
            });
            const filePath = specificFileContent.data.path
            const sourceFileName = filePath.match(/postman\/collections\/(.*)\.json/)[1];

            try {
                const targetFileContent = await octokit.rest.repos.getContent({
                    ...context.repo,
                    path: `postman/schemas/${sourceFileName}.yaml`
                });
                console.log(targetFileContent)
            }
            catch(error) { 
                console.log(error)
            }

            
            //const targetSHA = targetFileContent.sha

            


            const dataFromBase64 = Buffer.from(specificFileContent.data.content, 'base64').toString()
    
            const openapi = transpile(JSON.parse(dataFromBase64));
            const openapiyaml = yaml.dump(openapi)
            let openapiBase64 = Buffer.from(openapiyaml).toString('base64');
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


    } catch (error) {
        console.log(error)
     core.setFailed(error.message);
    }
}