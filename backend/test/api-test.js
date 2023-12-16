const request = require('supertest')('http://localhost:5000');
const expect = require('chai').expect;

// MAKE SURE THAT THE ENVIRONMENT VARIABLE FOR THE SERVER IS SET TO testing AND THAT THE SERVER IS STARTED FIRST.
// THE SERVER HAS TO BE RESTARTED EVERY TIME YOU WANT TO RUN THIS TEST!!!

describe('GET /', function() {
  it('returns all people in the database', async function() {
    const response = await request.get('/');
    expect(response.status).to.eql(200);
    expect(response.body.length).to.eql(2);
    expect(response.body[0]['fullname']).to.eql('Jan Jansen');
  });
});

describe('GET /search', function() {
  it('should find user Jan Jansen', async function() {
    const response = await request.get('/search?shortname=jja');
    expect(response.status).to.eql(200);
    expect(response.body.length).to.eql(1);
    expect(response.body[0]['fullname']).to.eql('Jan Jansen');
  });
  it('should find user Peter Peters', async function() {
    const response = await request.get('/search?shortname=ppe01');
    expect(response.body.length).to.eql(1);
    expect(response.body[0]['fullname']).to.equal('Peter Peters');
  });
  it('should find both users', async function() {
    const response = await request.get('/search?shortname=01');
    expect(response.status).to.eql(200);
    expect(response.body.length).to.eql(2);
  });
  it('should not find any user with shortname tst01', async function() {
    const response = await request.get('/search?shortname=tst01');
    expect(response.status).to.eql(200);
    expect(response.body.length).to.equal(0);
  });
});

describe('POST /', function() {
  it('should be able to add new user', async function() {
    let response = await request
        .post('/')
        .send({fullname: 'Klaas Klaasen', shortname: 'kkl01', email: 'k.klaasen@test.saxion.nl'});

    // Now check if the record is present
    response = await request.get('/search?shortname=kkl01');
    expect(response.status).to.eql(200);
    expect(response.body.length).to.eql(1);
    expect(response.body[0]['fullname']).to.eql('Klaas Klaasen');
    expect(response.body[0]['email']).to.eql('k.klaasen@test.saxion.nl');
  });
  // TODO for students: write a couple of bad weather tests, to make sure no duplicate users can be added and also no missing attributes are allowed!
  it('should not add duplicate user', async function() {
    const duplicateUser = {fullname: 'Jan Jansen', shortname: 'jja01', email: 'jan.jansen@test.saxion.nl'};
    const response = await request.post('/').send(duplicateUser);
    expect(response.status).to.eql(400);
    expect(response.body.error).to.eql('Could not add person to database. Database error occured.');
  });

  it('should require fullname in the request', async function() {
    const userWithoutFullname = {shortname: 'abc01', email: 'test@example.com'};
    const response = await request.post('/').send(userWithoutFullname);
    expect(response.status).to.eql(400);
    expect(response.body.error).to.eql('Invalid record received. Can not add the user.');
  });

  it('should require shortname in the request', async function() {
    const userWithoutShortname = {fullname: 'John Doe', email: 'john.doe@example.com'};
    const response = await request.post('/').send(userWithoutShortname);
    expect(response.status).to.eql(400);
    expect(response.body.error).to.eql('Invalid record received. Can not add the user.');
  });

  it('should require email in the request', async function() {
    const userWithoutEmail = {fullname: 'John Doe', shortname: 'jdo01'};
    const response = await request.post('/').send(userWithoutEmail);
    expect(response.status).to.eql(400);
    expect(response.body.error).to.eql('Invalid record received. Can not add the user.');
  });
});
