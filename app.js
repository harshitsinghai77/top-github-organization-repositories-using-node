const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

require('dotenv').config();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


async function getAllRepos(list){
    const promises = list.map(function (item) { 
        return axios.get(item)
            .then(resp => {
                const sortedData = resp.data.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0,3);
                return sortedData
            });
    });
    const result = Promise.all(promises).then(function (repo) { 
        repo = [].concat.apply([], repo); 
        let sortedData = repo.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0,3);
        return sortedData.map(value => {
            return {
                name: value.name,
                stars: value.stargazers_count
            }
        })
    });
    return result;
}

app.get('/', (req, res) => {
    res.send("Hello world")
})

app.post('/repos', (req, res) => {
    
    const organization = req.body.org
    if (!organization){
        return res.json({"results": "Invalid organization name. Please enter valid github organization"})
    }

    let start_time = new Date().getTime();

    axios.get(`https://api.github.com/orgs/${organization}/repos?per_page=100&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`)
        .then(async resp => {
            const link = resp.headers.link
            if(link){
                const totalPages = parseInt(link.split(",")[1].split(">")[0].split("&page=")[1])
                const allRepo = []
                
                for(let i=1; i<totalPages+1; i++){
                    allRepo.push(`https://api.github.com/orgs/${organization}/repos?per_page=100&page=${i}&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`)
                }

                const data = await getAllRepos(allRepo)

                console.log('Time elapsed since queuing the request:', new Date().getTime() - start_time);
                return res.json({"results": data, "Time elapsed since queuing the request(in ms):" : new Date().getTime() - start_time})

            }else{
                let sortedData = resp.data.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0,3);
                sortedData = sortedData.map(value => {
                    return {
                        name: value.name,
                        stars: value.stargazers_count
                    }
                })
                
                return res.json({"results": sortedData, "Time elapsed since queuing the request(in ms):" : new Date().getTime() - start_time})
            }
        })
        .catch(error => {
            res.json({"results": "No such organization found!"})
        });
       
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Listening to port 3000')
})