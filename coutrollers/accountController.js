const sign = require('jsonwebtoken').sign;
const Firestore = require('@google-cloud/firestore');

const firestore = new Firestore({
  projectId: 'swissid-c228f',
  keyFilename: './swissid-c228f-firebase-adminsdk-gnl8m-7c9c7b994f.json',
});

const saltRounds = 10;

exports.createNewAccount = (req, res) => {
  const {
    abc_account,
    iban_funding_account,
    funding_account,
    email,
    name
  } = req.body;

  const bic = "XYZCH89";
  const iban = "CH33 0078 1015 5036 7150 3";
  const currency = "CHF";
  const account_status = "active";
  const product_cost = "XYZ basic account | CHF 10 per month + additional fee per CHF stored";  
  const balance = 0;

  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const nd = new Date(utc + (3600000 * '+2'));
  const time_created = nd.toLocaleString();

  const activities = [{ event: "ACCOUNT", time: time_created }];

  firestore.collection('users').doc(email).set({
    abc_account,
    activities,
    account_status,
    bic,
    currency,
    funding_account,
    iban_funding_account,
    iban,
    product_cost,
    email,
    name,
    balance,
    time_created,
  }).then(() => {
    const accessToken = sign({
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data: email,
    }, 'secret');
    res.status(200).send({
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
      time_created
    });
  }).catch((err) => {
    console.log(err);
    res.status(404).send(err);
  })
}
exports.getAccountInfo = (req, res) => {
  
}