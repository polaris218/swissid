const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const Firestore = require('@google-cloud/firestore');
const smtpTransport = require('nodemailer-smtp-transport');
const sign = require('jsonwebtoken').sign;
const axios = require('axios');
const request = require('request');
const decode = require('jsonwebtoken').decode;

const saltRounds = 10;

const firestore = new Firestore({
  projectId: 'swissid-c228f',
  keyFilename: './swissid-c228f-firebase-adminsdk-gnl8m-7c9c7b994f.json',
});
const collection = firestore.collection('users');

/**
 * @see https://stackoverflow.com/questions/46880323/how-to-check-if-a-cloud-firestore-document-exists-when-using-realtime-updates
 * Judgement whether the collection is exist or not
 */
exports.getUserExistency = (req, res) => {
  const { email, name } = req.body;
  collection.doc(email).get()
    .then(docSnapShot => {
      if (docSnapShot.exists) {
        const exist = true;
        const accessToken = sign({
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
          data: email,
        }, 'secret');

        const {
          abc_account,
          account_status,
          bic,
          currency,
          funding_account,
          iban_funding_account,
          iban,
          product_cost,
          name,
          balance,
          time_created
        } = docSnapShot.data();

        res.status(200).send({
          exist,
          accessToken,
          abc_account,
          account_status,
          bic,
          currency,
          funding_account,
          iban_funding_account,
          iban,
          product_cost,
          name,
          balance,
          time_created,
        })
      } else {
        res.status(200).send({ exist: false });
      }
    });
}
exports.sendEmail = (req, res) => {
  const id = Math.floor(100000 + Math.random() * 900000).toString();
  const {
    email
  } = req.body;

  const transport = nodemailer.createTransport(smtpTransport({
    name: 'swissid-c228f.firebaseapp.com',
    host: 'smtp.gmail.com',
    post: 587,
    secure: true,
    auth: {
      user: 'janepress940214@gmail.com',
      pass: '##lni19940214'
    },
  }));
  const mailOptions = {
    from: 'janepress940214@gmail.com',
    to: email,
    subject: 'Account Verification',
    text: "",
    html: `Your verification code is <b>${id}</b>`,
  };

  transport.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(404).send(error);
    } else {
        const document = firestore.doc(`verify/${info.messageId}`);
          document.set({
              id,
          }).then(() => {
            const messageId = { messageId: info.messageId };
            res.status(200).send(messageId);
          })
      }
  });
}

exports.userInfo = (req, res) => {
  const { code } = req.body;
  request.post(
    {
      url: "https://login.int.swissid.ch/idp/oauth2/access_token",
      form: {
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
}