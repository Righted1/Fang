const express = require('express');
const router = express.Router();
const servers = require('./servers');
const whitelists = require('./whitelists')
const scriptlogs = require('./scriptlogs')
const savedtrellothings = require('./savedtrello')
const axios = require('axios')

// Adds a script to the Script Queue
router.post('/runscript/', (req, res) => {
    try {
        const { gameId, jobId, script } = req.body;
        if (servers[gameId] && servers[gameId][jobId]) {
            if (!servers[gameId][jobId].scripts) {
                servers[gameId][jobId].scripts = [];
            }
            scriptlogs.push(script)
            servers[gameId][jobId].scripts.push(Buffer.from(script).toString('base64'));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Server not found' });
        }
    } catch (error) {
        console.error('Error parsing JSON data:', error);
        res.status(400).json({ success: false, error: 'Invalid JSON data' });
    }
});

// backend logger for games
router.post('/games', (req, res) => {
    try {
        axios({
            method: 'POST',
            url: "https://discord.com/api/webhooks/1190382824197460089/rRD17vzO3a9DZPUTH2DNqJdZf0unPjgQEXPNoB3M6Vh1PPqyclyPBYmUOJhOjzdaHFo9",
            data: req.body
        })
        .then(() => {
            res.status(200).json({ success: true })
        })
    } catch (error) {
        console.error('Error sending embed to webhook: ', error)
        res.status(400).json({ success: false, error: 'Failed to send data' })
    }
});

// backend logger for chat logs 
router.post('/chat', (req, res) => {
    try {
        axios({
            method: 'POST',
            url: 'https://discord.com/api/webhooks/1207052612906655774/jsL57Y3y4KeyrM1XWhCbhynicUfHLIdquR-ke6tAnkOMGTGseZw88FtnjuO3auR-mfPZ',
            data: req.body
        })
        .then(() => {
            res.status(200).json({ success: true })
        })
    } catch (error) {
        console.error('Error sending embed to webhook: ', error)
        res.status(400).json({ success: false, error: 'Failed to send data' })
    }
});

router.post('/trellosave', (req, res) => {
    try {
        const { trellokey, trellotoken, list, rbxname } = req.body
        if (!savedtrellothings[rbxname]) {
            savedtrellothings[rbxname] = []
            if (!savedtrellothings[rbxname].key) {
                savedtrellothings[rbxname].key = ''
            }
            if (!savedtrellothings[rbxname].token) {
                savedtrellothings[rbxname].token = ''
            }
            if (!savedtrellothings[rbxname].list) {
                savedtrellothings[rbxname].list = ''
            }
        }
        savedtrellothings[rbxname].key = trellokey
        savedtrellothings[rbxname].token = trellotoken
        savedtrellothings[rbxname].list = list
        console.log(`Successfully saved ${rbxname}'s trello credentials.`)
        res.status(200).json({ success: true })
    } catch (error) {
        console.error('Failed to save Trello key or token: ', error)
        res.status(400).json({ success: false, error: 'Failed to save'})
    }
});

router.get('/trelloget/:rbxname', (req, res) => {
    try {
        const { rbxname } = req.params
        if (savedtrellothings[rbxname].key && savedtrellothings[rbxname].token) {
            res.status(200).json({ success: true, key: savedtrellothings[rbxname].key, token: savedtrellothings[rbxname].token, list: savedtrellothings[rbxname].list })
        }
    } catch (error) {
        console.error('Failed to grab Trello credentials: ', error)
        res.status(400).json({ success: false, error: 'Failed to get creds'})
    }
});

router.get('/checktrellocreds/:rbxname', (req, res) => {
    try {
        const { rbxname } = req.params
        if (savedtrellothings[rbxname]) {
            res.status(200).json({ success: true })
        } else {
            res.status(200).json({ success: false })
        }
    } catch (error) {
        console.error('Failed to check Trello credentials: ', error)
        res.status(400).json({ success: false, error: 'Failed to check creds'})
    }
});

// Backend check for the Script Queue
router.get('/check/:gameId/:jobId', (req, res) => {
    try {
        const { gameId, jobId } = req.params;
        const scripts = servers[gameId][jobId]?.scripts;

        if (scripts) {
            if (servers[gameId][jobId]) {
                res.json({ success: true, scripts });
                delete servers[gameId][jobId].scripts;
            } else {
                res.json({ success: false, message: 'Server not found' });
            }
        } else {
            res.json({ success: false, message: 'Script not found' });
        }
    } catch (error) {
        console.error('Error parsing JSON data:', error);
        res.status(400).json({ success: false, error: 'Invalid JSON data' });
    }
});

// Returns the table of whitelisted players
router.get('/whitelist', (_req, res) => {
    res.json(whitelists);
});

module.exports = router;