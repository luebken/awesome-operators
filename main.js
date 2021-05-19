const { stat } = require('fs');
const https = require('https')

const fs = require('fs');
const readline = require('readline');

// cat README.md | ggrep -oP '\[(.*\/.*)\]' > repos-2021-05-19.txt
async function processLineByLine() {
    const fileStream = fs.createReadStream('repos-2021-05-19.txt');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    let repos = []
    for await (const line of rl) {
        repos.push(line)
    }
    return repos
}


async function queryAll() {
    repos = await processLineByLine();
    console.log(repos)

    let stats = []
    for (const reponame of repos) {
        let stat = await queryRepoStats(reponame)
        stats.push(stat)
    }
    // remove empty
    stats = stats.filter(value => Object.keys(value).length !== 0);
    stats = stats.sort((a, b) => b.stargazers_count - a.stargazers_count);

    console.log(stats)
}

async function queryRepoStats(reponame, cb) {
    return new Promise((resolve, reject) => {

        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: '/repos/' + reponame,
            method: 'GET',
            headers: {
                "User-Agent": "luebken-awesome-operators",
                "Authorization": "token " + process.env.GITHUB_TOKEN
            }
        }
        process.stdout.write(".");
        const req = https.request(options, res => {
            let body = "";
            let status = res.statusCode
            let stats = {}
            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                try {
                    let json = JSON.parse(body);
                    if (status == 200) { // TODO follow redirect
                        stats.reponame = reponame
                        stats.description = json.description
                        stats.full_name = json.full_name
                        stats.stargazers_count = json.stargazers_count
                        stats.watchers_count = json.watchers_count
                        stats.archived = json.archived
                        resolve(stats)
                    } else {
                        console.log(reponame + " status " + status)
                        resolve({})
                    }
                } catch (error) {
                    console.error(error.message);
                };

            });
        })

        req.on('error', error => {
            console.error(error)
        })

        req.end()

    })

}

queryAll()