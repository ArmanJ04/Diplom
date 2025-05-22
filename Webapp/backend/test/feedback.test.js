// feedback.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const app = require('../server'); // Make sure this exports your Express app

chai.use(chaiHttp);
const expect = chai.expect;

// Generate a valid JWT token for testing (adjust secret and payload to your app)
const testToken = jwt.sign(
  { id: 'doctorUserId', role: 'doctor' },       // Payload: user id and role
  process.env.JWT_SECRET || 'your_jwt_secret', // Use your actual JWT secret or a test secret
  { expiresIn: '1h' }
);

describe('Feedback API', () => {
  it('should allow doctor to submit feedback', done => {
    chai.request(app)
      .post('/api/feedback')
      .set('Authorization', 'Bearer ' + testToken)
      .send({
        predictionId: '60fd8e8e3f1a4a0015e4a1b2', // Use valid test prediction ID
        confirmed: true,
        comment: 'Prediction is accurate.'
      })
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'Feedback submitted');
        done();
      });
  });
});
