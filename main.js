const https = require('https')
//https://github.com/operator-framework/awesome-operators
let repos = ["GoogleCloudPlatform/airflow-operator"]


let repos_stats = []


repos.forEach(reponame => {
    queryRepoStats(reponame, function (stats) {
        console.log(stats)
        repos_stats.push(stats)
    })    
});

function queryRepoStats(repo, cb) {
    const options = {
        hostname: 'api.github.com',
        port: 443,
        path: '/repos/' + repo,
        method: 'GET',
        headers: {
            "User-Agent": "luebken-awesome-operators"
        }
    }

    const req = https.request(options, res => {
        let body = "";
        let stats = {}
        res.on("data", (chunk) => {
            body += chunk;
        });

        res.on("end", () => {
            try {
                let json = JSON.parse(body);
                //console.log(json)
                stats.full_name = json.full_name
                stats.stargazers_count = json.stargazers_count
                stats.watchers_count = json.watchers_count
                stats.archived = json.archived
                cb(stats)
            } catch (error) {
                console.error(error.message);
            };

        });
    })

    req.on('error', error => {
        console.error(error)
    })

    req.end()


}