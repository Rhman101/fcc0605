/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
const Thread = require('../models/thread');
const uuidv4 = require('uuid/v4');

chai.use(chaiHttp);

suite('Functional Tests', function() {
	suite('API ROUTING FOR /api/threads/:board', function() {
		suite('POST ends with correct data', function() {
			test('POST with all required information', (done) => {
				let textString = uuidv4();
				chai.request(server)
					.post('/api/threads/testBoard')
					.send({
						text: textString,
						delete_password: 'delete_passwordText'
					})
					.end(async (err, res) => {
						if (err) {
							return console.log('Error!', error);
						}
						assert.equal(res.status, 200);
						assert.equal(res.redirects[0].endsWith('/b/testBoard/'), true);
						let savedThread = await Thread.find({ text: textString });
						assert.equal(savedThread[0].text, textString);
						done();
					});
			});
		});

		suite('GET', function() {
			test('GET with correct data', (done) => {
				chai.request(server)
					.get('/api/threads/testBoard')
					.end((err, res) => {
						if (err) {
							return console.log(err);
						}
						const repliesNumAndContent = (input) => {
							input.forEach((elem) => {
								if (elem.replies.length > 3) {
									return false;
								}
								if (elem.delete_password) {
									return false;
								}
							});
							return true;
						};
						assert.equal(res.body.length > 0, true);
						assert.equal(res.body.length < 11, true);
						assert.equal(repliesNumAndContent(res.body), true);
						res.body.forEach((elem) => {
							assert.property(elem, '_id');
							assert.property(elem, 'text');
							assert.property(elem, 'board');
							assert.property(elem, 'created_on');
							assert.property(elem, 'bumped_on');
							assert.property(elem, 'replies');
							assert.notProperty(elem, 'reported');
							assert.notProperty(elem, 'delete_password');
						});
						done();
					});
			});
		});

		suite('DELETE', function() {
			test('DELETE thread with correct password', (done) => {
				let textString = uuidv4();
				chai.request(server)
					.post('/api/threads/testBoard')
					.send({
						text: textString,
						delete_password: 'anything'
					})
					.end(async (err, res) => {
						if (err) {
							return console.log(err);
						}
						let x = await Thread.findOne({ text: textString });
						let id = x._id;
						chai.request(server)
							.delete('/api/threads/testBoard')
							.send({
								thread_id: id,
								delete_password: 'anything'
							})
							.end((err, res) => {
								if (err) {
									return console.log(err);
								}
								assert.equal(res.status, 200);
								assert.equal(res.text, 'success');
								done();
							});
					});
			});

			test('DELETE thread with incorrect password', (done) => {
				let textString = uuidv4();
				chai.request(server)
					.post('/api/threads/testBoard')
					.send({
						text: textString,
						delete_password: 'anything'
					})
					.end(async (err, res) => {
						if (err) {
							return console.log(err);
						}
						let x = await Thread.findOne({ text: textString });
						let id = x._id;
						chai.request(server)
							.delete('/api/threads/testBoard')
							.send({
								thread_id: id,
								delete_password: 'NOTanything'
							})
							.end((err, res) => {
								if (err) {
									return console.log(err);
								}
								assert.equal(res.status, 200);
								assert.equal(res.text, 'incorrect password');
								done();
							});
					});
			});
		});

		suite('PUT', function() {
			test('PUT thread reported to true', (done) => {
				let threadText = uuidv4();
				chai.request(server)
				.post('/api/threads/testBoard')
				.send({
					text: threadText,
					delete_password: 'anything'
				})
				.end(async (err, res) => {
					if (err) {
						return console.log(err);
					}
					let thread = await Thread.findOne({ text: threadText });
					let thread_id = thread._id;
					chai.request(server)
					.put('/api/threads/testBoard')
					.send({
						report_id: thread_id
					})
					.end(async (err, res) => {
						if (err) {
							return console.log(err);
						}
						assert.equal(res.status, 200);
						let threadAgain = await Thread.findOne({ text: threadText });
						assert.equal(threadAgain.reported, true);
						assert.equal(res.text, 'success');
						done();

					})
				})
			})
			test('PUT thread wrong id', (done) => {
				let threadText = uuidv4();
				chai.request(server)
				.post('/api/threads/testBoard')
				.send({
					text: threadText,
					delete_password: 'anything'
				})
				.end(async (err, res) => {
					if (err) {
						return console.log(err);
					}
					let thread = await Thread.findOne({ text: threadText });
					let thread_id = thread._id;
					chai.request(server)
					.put('/api/threads/testBoard')
					.send({
						thread_id: '48h398h3409830849th403'
					})
					.end(async (err, res) => {
						if (err) {
							return console.log(err);
						}
						assert.equal(res.status, 200);
						assert.equal(res.text, 'fail')
						done();

					})
				})
			})
		});
	});

	suite('API ROUTING FOR /api/replies/:board', function() {
		suite('POST', function() {
			test('POST with all required data', function(done) {
				let textString = uuidv4();
				chai.request(server)
					.post('/api/threads/testBoard')
					.send({
						text: textString,
						delete_password: 'delete_passwordText'
					})
					.end(async (err, res) => {
						if (err) {
							return console.log('Error!', error);
						}
						let savedThread = await Thread.find({ text: textString });
						chai.request(server)
							.post('/api/replies/testBoard')
							.send({
								thread_id: savedThread[0]._id,
								text: uuidv4(),
								delete_password: uuidv4()
							})
							.end(async (err, res) => {
								if (err) {
									return console.log(err);
								}
								assert.equal(res.status, 200);
								assert.equal(res.redirects[0].endsWith(`/b/testBoard/${savedThread[0]._id}`), true);
								done();
							});
					});
			});
		});

		suite('GET', function() {
			test('GET with all required fields', (done) => {
				let textString = uuidv4();
				chai.request(server)
					.post('/api/threads/testBoard')
					.send({
						text: textString,
						delete_password: uuidv4()
					})
					.end(async (err, res) => {
						if (err) {
							return console.log(err);
						}
						let x = await Thread.findOne({ text: textString });
						let id = x._id;
						chai.request(server)
							.get(`/api/replies/testBoard?thread_id=${id}`)
							.end((err, res) => {
								if (err) {
									return console.log(err);
								}
								assert.property(res.body, '_id');
								assert.property(res.body, 'text');
								assert.property(res.body, 'board');
								assert.property(res.body, 'created_on');
								assert.property(res.body, 'bumped_on');
								assert.property(res.body, 'replies');
								done();
							});
					});
			});
		});

		suite('PUT', function() {
			test('PUT reply with correct input', function(done) {
				this.timeout(5000);
				let textString = uuidv4();
				chai.request(server)
					.post('/api/threads/testBoard')
					.send({
						text: textString,
						delete_password: 'delete_passwordText'
					})
					.end(async (err, res) => {
						if (err) {
							return console.log('Error!', error);
						}
						let savedThread = await Thread.find({ text: textString });
						let savedThreadId = savedThread[0]._id;
						chai.request(server)
							.post('/api/replies/testBoard')
							.send({
								thread_id: savedThreadId,
								text: uuidv4(),
								delete_password: uuidv4()
							})
							.end(async (err, res) => {
								if (err) {
									return console.log(err);
								}
								let thread = await Thread.find({ text: textString });
								let savedReplyId = thread[0].replies[0]._id;
								let object = {
									thread_id: savedThreadId,
									reply_id: savedReplyId
								};
								chai.request(server)
									.put('/api/replies/testBoard')
									.send(object)
									.end(async (err, res) => {
										if (err) {
											return console.log(err);
										}
										let testThread;
										try {
											testThread = await Thread.findById(savedThreadId);
										} catch (e) {
											console.log('ERROR', e);
										}
										assert.equal(testThread.replies[0].reported, true)
										assert.equal(res.text, 'successfully reported');
										done();
									});
							});
					});
			});
		});

		suite('DELETE', function() {
			test('DELETE reply with correct password', function(done) {
				let textString = uuidv4();
				chai.request(server)
					.post('/api/threads/testBoard')
					.send({
						text: textString,
						delete_password: 'delete_passwordText'
					})
					.end(async (err, res) => {
						if (err) {
							return console.log('Error!', error);
						}
						let savedThread = await Thread.find({ text: textString });
						let savedDeletePassword = uuidv4();
						let savedThreadId = savedThread[0]._id;
						chai.request(server)
							.post('/api/replies/testBoard')
							.send({
								thread_id: savedThreadId,
								text: uuidv4(),
								delete_password: savedDeletePassword
							})
							.end(async (err, res) => {
								if (err) {
									return console.log(err);
								}
								let thread = await Thread.find({ text: textString });
								let savedReplyId = thread[0].replies[0]._id;
								let object = {
									thread_id: savedThreadId,
									reply_id: savedReplyId,
									delete_password: savedDeletePassword
								};
								chai.request(server)
									.delete('/api/replies/testBoard')
									.send(object)
									.end(async (err, res) => {
										if (err) {
											return console.log(err);
										}
										assert.equal(res.status, 200);
										assert.equal(res.text, 'success');
										let deleted = await Thread.find({ text: textString });
										assert.equal(deleted[0].replies[0].text, '[deleted]');
										done();
									});
							});
					});
			});

			test('DELETE reply with incorrect password', function(done) {
				let textString = uuidv4();
				chai.request(server)
					.post('/api/threads/testBoard')
					.send({
						text: textString,
						delete_password: 'delete_passwordText'
					})
					.end(async (err, res) => {
						if (err) {
							return console.log('Error!', error);
						}
						let savedThread = await Thread.find({ text: textString });
						let savedDeletePassword = uuidv4();
						let savedThreadId = savedThread[0]._id;
						chai.request(server)
							.post('/api/replies/testBoard')
							.send({
								thread_id: savedThreadId,
								text: uuidv4(),
								delete_password: savedDeletePassword
							})
							.end(async (err, res) => {
								if (err) {
									return console.log(err);
								}
								let thread = await Thread.find({ text: textString });
								let savedReplyId = thread[0].replies[0]._id;
								let object = {
									thread_id: savedThreadId,
									reply_id: savedReplyId,
									delete_password: 'someIncorrectPassword'
								};
								chai.request(server)
									.delete('/api/replies/testBoard')
									.send(object)
									.end(async (err, res) => {
										if (err) {
											return console.log(err);
										}
										assert.equal(res.status, 200);
										assert.equal(res.text, 'incorrect password');
										done();
									});
							});
					});
			});
		});
	});
});
