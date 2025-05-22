const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // ✅ point to app.js

chai.use(chaiHttp);
const expect = chai.expect;

describe('Auth API', () => {
  it('should return JWT for valid doctor login', done => {
    chai.request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@example.com', password: 'test1234' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });

  it('should reject invalid login credentials', done => {
    chai.request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpass' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});
