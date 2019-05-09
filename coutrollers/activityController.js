const Firestore = require('@google-cloud/firestore');
const decode = require('jsonwebtoken').decode;

const saltRounds = 10;

const firestore = new Firestore({
  projectId: 'swissid-c228f',
  keyFilename: './swissid-c228f-firebase-adminsdk-gnl8m-7c9c7b994f.json',
});
const collection = firestore.collection('users');

exports.getUserActivity = (req, res) => {
  const { authorization } = req.query;
  const email = decode(authorization).data;
  
  const db = collection.doc(email);
  db.get()
    .then(result => {
      const { activities } = result.data();
      res.status(200).send(activities);
    })
    .catch(err => {
      res.status(404).send(err);
    });
}