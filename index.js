const express = require('express')
const dotenv = require('dotenv')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 3005

dotenv.load()

console.log('Now the value for FOO is:', process.env)

const filePath = `${process.env.PATHFILE}${process.env.FILENAME}.${process.env.FORMAT}`;

app.get('/', (req, res) => {
    loggingToFile(req, res)
    res.send('Hello World!')
})

app.get('/user/:id', function (req, res) {
    loggingToFile(req, res)
    res.send('user' + req.params.id)
})

app.post('/user', function (req, res) {
    loggingToFile(req, res)
    res.send('test-post:' + req.query.name + ' ' + req.query.username)
})

const readFileJSON = (callback, filePath, encoding = 'utf8') => {
    fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
            throw err;
        }
        callback(data ? JSON.parse(data) : []);
    });
};

const writeFileJSON = (fileData, callback, filePath, encoding = 'utf8') => {
    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) {
            throw err;
        }
        callback();
    });
};

const findAll = (callback, filePath) => {
    readFileJSON(data => {
        callback(data);
    }, filePath);
}

function loggingToFile(req, res) {
    if (process.env.FORMAT === 'txt') {
        let string = `${new Date()} PORT: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress} ${req.method} ${req.url}, RESPONSE ${res.statusCode} \n`
        fs.appendFile(filePath, string, (err) => {
            console.log(err)
        })
    } else {
        try {
            findAll((data) => {
                const logs = [...data]
                logs.push({
                    datetime: new Date(),
                    remoteAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                    method: req.method,
                    path: req.url,
                    statusCode: res.statusCode
                })
                writeFileJSON(JSON.stringify(logs, null, 2), () => {
                }, filePath);
            }, filePath)
        } catch (err) {
            console.log(err)
        }
    }
}

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
