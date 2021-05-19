const { stat } = require('fs');
const https = require('https')

async function queryAll() {
    //https://github.com/operator-framework/awesome-operators
    let repos = [
        "travelaudience/aerospike-operator",
        "GoogleCloudPlatform/airflow-operator",
        "aerogear/android-sdk-operator",
        "application-runtimes/operator",
        "appsody/appsody-operator",
        "aquasecurity/aqua-operator",
        "arangodb/kube-arangodb",
        "argoproj/argo-cd",
        "didil/autobucket-operator",
        "giantswarm/aws-operator",
        "aws/aws-controllers-k8s",
        "aws/amazon-sagemaker-operator-for-k8s",
        "microsoft/azure-databricks-operator",
        "apache/camel-k",
        "datastax/cass-operator",
        "instaclustr/cassandra-operator",
        "vgkowski/cassandra-operator",
        "jetstack/navigator",
        "Orange-OpenSource/cassandra-k8s-operator",
        "kudobuilder/operators/cassandra",
        "containership/cerebral",
        "jetstack/cert-manager",
        "eclipse/che-operator",
        "Altinity/clickhouse-operator",
        "cloudfoundry/cf-operator",
        "linki/cloudformation-operator",
        "eshepelyuk/cmak-operator",
        "python/consul-operator",
        "Juniper/contrail-operator",
        "couchbase/operator",
        "ibm/couchdb-operator",
        "nicolai86/couchdb-operator",
        "Dynatrace/dynatrace-oneagent-operator",
        "kubic-project/dex-operator",
        "microdc/k8s-dynamodb-operator",
        "kloeckner-i/db-operator",
        "deepfabric/elasticell-operator",
        "elastic/cloud-on-k8s",
        "upmc-enterprises/elasticsearch-operator",
        "jetstack/navigator",
        "kudobuilder/operators/elastic",
        "teseraio/ensemble",
        "solo-io/envoy-operator",
        "ContainerSolutions/externalsecrets-operator",
        "coreos/etcd-operator",
        "lyft/flinkk8soperator",
        "fluxcd/flux",
        "fluxcd/helm-operator",
        "verfio/fortio-operator"
    ]
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