describe('Prediction API', () => {
  it('should return a risk level and probability', done => {
    const token = 'YOUR_VALID_JWT_TOKEN';
    chai.request(app)
      .post('/api/predict')
      .set('Authorization', `Bearer ${token}`)
      .send({
        age: 60,
        systolic: 140,
        diastolic: 90,
        cholesterol: 2,
        glucose: 1,
        smoking: 1,
        alcohol: 0,
        physical_activity: 1,
        bmi: 27.4
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('risk_level');
        expect(res.body).to.have.property('probability');
        done();
      });
  });
});
