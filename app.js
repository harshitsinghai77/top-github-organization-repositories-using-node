// Basic Routes libraries
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

//Logging
const pino = require('pino')("./logs/info.log");;
const expressPino = require("express-pino-logger")({
    logger: pino
});

//Including ENV file
require('dotenv').config(); 

//Express Middleware
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressPino);

app.get('/', (req, res) => {
 res.send('Hello World');
});

// Async function which iteratively makes request to organization contaning more than 100 respositories per page
async function getAllRepos(list){
    //List -> Array containing endpoints of all pages
    const promises = list.map(function (item) { 
        return axios.get(item)
            .then(resp => {
                //Sorting top 3 respository of particular page based on stargazers_count (total stars) and slicing top 3 
                const sortedData = resp.data.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0,3);

                //Returning top 3 starred repository of particular page
                return sortedData
            });
    });

    //Waiting all the asynchronous function to complete
    const result = Promise.all(promises).then(function (repo) { 

        //Flattening 2D array to 1D
        repo = [].concat.apply([], repo); 

        //Sorting top 3 respository of all page based on stargazers_count (total stars) and slicing top 3 
        let sortedData = repo.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0,3);

        //Filtering only name and stars and removing all other information
        return sortedData.map(value => {
            return {
                name: value.name,
                stars: value.stargazers_count
            }
        })
    });

    //Returning top 3 starred repository of all pages
    return result;
}

//Repos endpoint
app.post('/repos', (req, res) => {
    const organization = req.body.org

    //Empty request without organization name
    if (!organization){
        return res.json({"results": "Oganization name not found. Please enter valid github organization name"})
    }

    // Response time start time
    let start_time = new Date().getTime();

    //Using GitHub API
    axios.get(`https://api.github.com/orgs/${organization}/repos?per_page=100&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`) // Used client_id and client_secret to increase API call limit
        .then(async resp => {
            const link = resp.headers.link // Getting next pages (if exist)
            if(link){ // Organization with more than 1 page

                //Extracting total number of pages in the organization
                const totalPages = parseInt(link.split(",")[1].split(">")[0].split("&page=")[1]) 
                const allRepo = []
                
                // Endpoints for all the pages of the organization
                for(let i=1; i<totalPages+1; i++){
                    allRepo.push(`https://api.github.com/orgs/${organization}/repos?per_page=100&page=${i}&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`)
                }

                // Collecting and sorting all the repos based on stars
                const data = await getAllRepos(allRepo)

                // Returning results and response time
                return res.json({"results": data, "Time elapsed since queuing the request(in ms):" : new Date().getTime() - start_time})

            }else{ // Organization with only 1 page

                //Sorting data based on stargazers_count (total stars) and slicing top 3 
                let sortedData = resp.data.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0,3);
                
                //Filtering only name and stars and removing all other information
                sortedData = sortedData.map(value => {
                    return {
                        name: value.name,
                        stars: value.stargazers_count
                    }
                })

                // Returning results and response time
                return res.json({"results": sortedData, "Time elapsed since queuing the request(in ms):" : new Date().getTime() - start_time})
            }
        })
        .catch(error => {
            // No organization with given found
            res.json({"results": "No such organization found!"})
        });
       
})

//Dynamic port, else 3000
const PORT = process.env.PORT || 3000;
module.exports = app.listen(PORT, () => {
    console.log('Server running on port %d', PORT);
})