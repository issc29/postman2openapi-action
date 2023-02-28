const core = require('@actions/core');
const github = require('@actions/github');
const { transpile } = require('postman2openapi');
const yaml = require('js-yaml');
const context = github.context
const octokit = github.getOctokit(myToken)


run();

async function run() {

    try {
        const myToken = core.getInput('myToken');
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
                //console.log(targetFileContent)
                const targetSHA = targetFileContent.sha
                writeYAML(specificFileContent.data.content, targetSHA)
                
            }
            catch(error) { 
                writeYAML(specificFileContent.data.content)
            }

            
            //



            


            
        }


    } catch (error) {
        console.log(error)
     core.setFailed(error.message);
    }
}


function writeYAML(data, sha){
    const dataFromBase64 = Buffer.from(data, 'base64').toString()
    
    const openapi = transpile(JSON.parse(dataFromBase64));
    const openapiyaml = yaml.dump(openapi)
    let openapiBase64 = Buffer.from(openapiyaml).toString('base64');

    var requestObj = {
        ...context.repo,
        path: "postman/schemas/created.yaml",
        message: "modify postman schema",
        content: openapiBase64,
        "committer.name": "action",
        "committer.email": "action@action.com",
        "author.name": "action",
        "author.email": "action@action.com",
        }
    (sha) ? (requestObj.sha = sha) : ''
    octokit.rest.repos.createOrUpdateFileContents(requestObj)
}