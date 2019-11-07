const inquirer = require("inquirer")
const generateHTML = require("./generateHTML")
const fs = require("fs")
const axios = require("axios")
const pdf = require("html-pdf")
const config = {
    "height": "14in",
    "width": "8in"
}

const questions = [
    {
        type: "list",
        name: "color",
        message: "What is your favorite color?",
        choices: [
            "green",
            "blue",
            "pink",
            "red"
        ]
    },
    {
        type: "input",
        name: "username",
        message: "What is your GitHub username?"
    }
];

inquirer
    .prompt(questions)
    .then(function (data) {
        const { color, username } = data

        return Promise.all([
            color,
            axios.get(`https://api.github.com/users/${username}?`),
            axios.get(`https://api.github.com/users/${username}/repos?&per_page=100`)
        ])
    })
    .then(([color, gitData, repoData]) => {

        const { followers, following, location, blog, name, company, avatar_url, bio, login } = gitData.data

        const numOfRepos = repoData.data.map(function (repo) {
            return repo.name
        })
        const starCount = repoData.data.map(element => {
            return element.stargazers_count
        });
        const starTotal = starCount.reduce((a, b) => a + b)

        pdf.create(generateHTML({ color: color, followers, following, location, blog, name, bio, login, company, avatar_url, repositories: numOfRepos.length, stars: starTotal }), config).toFile('./portfolio.pdf', function (err, res) {
            if (err) return console.log(err);
            console.log(res);
        });
    })


