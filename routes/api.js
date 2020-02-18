/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

// var expect = require('chai').expect;
const Thread = require('../models/thread');
const uuidv4 = require('uuid/v4');

module.exports = function(app) {
	app.route('/api/threads/:board')
		.post(async (req, res) => {
			try {
				let thread = new Thread({
					text: req.body.text,
					delete_password: req.body.delete_password,
					board: req.params.board,
					created_on: new Date(),
					bumped_on: new Date(),
					replies: []
				});
				await thread.save();
				res.redirect(`/b/${req.params.board}/`);
			} catch (e) {
				console.log('Error:', e);
				res.send('Error?');
			}
		})
		.get(async (req, res) => {
			try {
				let x = await Thread.find({
					board: req.params.board
				});
				x.sort((a, b) => {
					// Clean this up later.
					if (Date.parse(a.bumped_on) < Date.parse(b.bumped_on)) {
						return 1;
					} else {
						return -1;
					}
				});
				if (x.length > 10) {
					x.splice(10, x.length - 10);
				}
				x = x.map((elem) => {
					return {
						_id: elem._id,
						text: elem.text,
						board: elem.board,
						created_on: elem.created_on,
						bumped_on: elem.bumped_on,
						replycount: elem.replies.length,
						replies:
							elem.replies.length > 1
								? elem.replies
										.map((repliesElem) => {
											return {
												text: repliesElem.text,
												created_on: repliesElem.created_on,
												_id: repliesElem._id
											};
										})
										.sort((a, b) => (Date.parse(a.created_on) < Date.parse(b.created_on) ? 1 : -1))
										.filter((e, i) => i < 3 && e)
								: []
					};
				});
				res.json(x);
			} catch (e) {
				return console.log(e);
			}
		})
		.put(async (req, res) => {
			try {
				let thread_id = req.body.report_id;
				let thread = await Thread.findById(thread_id);
				thread.reported = true;
				await thread.save();
				res.send('success');
			} catch (e) {
				console.log(e);
				res.send('fail');
			}
		})
		.delete(async (req, res) => {
			try {
				let x = await Thread.findById(req.body.thread_id);
				if (x.delete_password === req.body.delete_password) {
					await Thread.findByIdAndRemove(req.body.thread_id);
					res.send('success');
				} else {
					res.send('incorrect password');
				}
			} catch (e) {
				return console.log(e);
			}
		});

	app.route('/api/replies/:board')
		.post(async (req, res) => {
			try {
				let id = req.body.thread_id;
				let thread = await Thread.findById(id);
				thread.bumped_on = new Date();
				thread.replies.push({
					text: req.body.text,
					delete_password: req.body.delete_password,
					created_on: new Date(),
					_id: uuidv4()
				});
				await thread.save();
				res.redirect(`/b/${req.params.board}/${id}`);
			} catch (e) {
				console.log(e);
			}
		})
		.get(async (req, res) => {
			try {
				let thread = await Thread.findById(req.query.thread_id);
				let response = {
					_id: thread._id,
					text: thread.text,
					board: thread.board,
					created_on: thread.created_on,
					bumped_on: thread.bumped_on,
					replies: thread.replies
				};
				if (response.replies.length > 0) {
					response.replies = response.replies.map((elem) => {
						return {
							text: elem.text,
							created_on: elem.created_on,
							_id: elem._id
						};
					});
				}
				res.json(response);
			} catch (e) {
				return console.log(e);
			}
		})
		.put(async (req, res) => {
			try {
				let thread = await Thread.findById(req.body.thread_id);
				let replyIndex = thread.replies.findIndex((elem) => elem._id === req.body.reply_id);
				if (replyIndex === -1) {
					return res.send('Incorrect data provided');
				}
				thread.replies = thread.replies.map((elem, index) => {
					if (index === replyIndex) {
						return {
							reported: true,
							text: elem.text,
							created_on: elem.created_on,
							_id: elem._id
						};
					} else {
						return elem;
					}
				});
				try {
					await thread.save();
				} catch (e) {
					return console.log('Error here', e);
				}
				res.send('successfully reported');
			} catch (e) {
				console.log(e);
			}
		})
		.delete(async (req, res) => {
			try {
				let thread = await Thread.findById(req.body.thread_id);
				let replyIndex = thread.replies.findIndex(
					(elem) => elem._id === req.body.reply_id && elem.delete_password === req.body.delete_password
				);
				if (replyIndex === -1) {
					return res.send('incorrect password');
				}
				thread.replies = thread.replies.map((elem, index) => {
					if (index === replyIndex) {
						return {
							reported: elem.reported,
							text: '[deleted]',
							created_on: elem.created_on,
							_id: elem._id
						};
					} else {
						return elem;
					}
				});
				await thread.save();
				res.send('success');
			} catch (e) {
				console.log(e);
			}
		});
};
