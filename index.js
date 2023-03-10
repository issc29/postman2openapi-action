const core = require('@actions/core');
const github = require('@actions/github');
const { transpile } = require('postman2openapi');
const yaml = require('js-yaml');
const context = github.context
const myToken = core.getInput('myToken');
const octokit = github.getOctokit(myToken)


run();

async function run() {

    try {
        
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
                console.log("write yaml for existing file")
                const targetSHA = targetFileContent.data.sha
                writeYAML(specificFileContent.data.content, sourceFileName, targetSHA)
                
            }
            catch(error) { 
                console.log(error)
                writeYAML(specificFileContent.data.content, sourceFileName)
            }

            
        }


    } catch (error) {
        console.log(error)
     core.setFailed(error.message);
    }
}


function writeYAML(data, filename, sha){
    const dataFromBase64 = Buffer.from(data, 'base64').toString()
    
    const openapi = transpile(JSON.parse(dataFromBase64));
    const openapiyaml = yaml.dump(openapi)
    let openapiBase64 = Buffer.from(openapiyaml).toString('base64');

    var requestObj = {
        ...context.repo,
        path: `postman/schemas/${filename}.yaml`,
        message: "modify postman schema",
        content: openapiBase64,
        "committer.name": "action",
        "committer.email": "action@action.com",
        "author.name": "action",
        "author.email": "action@action.com",
        }
    if(sha != null) {
        requestObj.sha = sha
    }
    console.log(`SHA:${sha}`)
    octokit.rest.repos.createOrUpdateFileContents(requestObj)
}