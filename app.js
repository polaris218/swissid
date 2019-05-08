const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');
const request = require('request');
const decode = require('jsonwebtoken').decode;


const app = express();
app.use(cors({ origin: true }));

const port = 8000;
const server = require('http').Server(app);

server.listen(port, () => {
  console.log(`server listening-->${port}`);
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/api/accesstoken", (req, res) => {
  const { code } = req.body;
  request.post(
    {
      url: "https://login.int.swissid.ch/idp/oauth2/access_token",
      form: {
        scope: ['openid', 'profile', 'email'],
        grant_type: "authorization_code",
        code,
        client_id: "2d19f-1580c-8f5a2-954c8",
        redirect_uri: "https://swissid-c228f.firebaseapp.com/",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic MmQxOWYtMTU4MGMtOGY1YTItOTU0Yzg6Y0hHNmlJYkpHdDhwWjhtOXIzeFR4R1lSREdsOWZXTGs="
      }
    },
    (err, response, body) => {
      if (err) throw err;
      else {
        const { access_token } = JSON.parse(body);
        axios.request({
          method: "get",
          url: "https://login.int.swissid.ch/idp/oauth2/userinfo",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`
          }
        }).then(result => {
          const { data } = result;
          res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
          res.header('Access-Control-Allow-Headers', 'Content-Type');
          res.header('Access-Control-Allow-Origin', '*');
          
          res.status(200).send(decode(data));
        }).catch(err => {
          console.log(err);
          res.send(err);
        }); 
      }  
    }
  )
});
