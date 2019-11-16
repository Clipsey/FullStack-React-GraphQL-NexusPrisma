import { queryType, mutationType, objectType, mutationField, stringArg } from 'nexus';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import config from './config';
import { withFilter } from 'graphql-yoga';

export const Query = queryType({
	definition(t) {
		t.crud.user();
		t.crud.users({ ordering: true });
		t.crud.post();
		t.crud.posts({ filtering: true, ordering: true });
	}
});

export const Mutation = mutationType({
	definition(t) {
		t.crud.createOneUser();
		t.crud.createOnePost();
		t.crud.deleteOneUser();
		t.crud.deleteOnePost();

		t.field('updatePost', {
			type: 'Post',
			args: {
				title: stringArg(),
				content: stringArg(),
				id: stringArg()
			},
			resolve: async (parent, { title, content, id }, ctx, info) => {
				// With Authentication setup, ensure that currentUser is the user creating the post

				const newPost = await ctx.photon.posts.update({
					where: {
						id
					},
					data: {
						title,
						content
					}
				});

				await ctx.pubsub.publish('POST_PUSH', {
					newPost
				});

				return newPost;
			}
		});

		t.field('makePost', {
			type: 'Post',
			args: {
				title: stringArg({ required: true }),
				authorEmail: stringArg({ required: true }),
				content: stringArg()
			},
			resolve: async (parent, { title, authorEmail, content }, ctx, info) => {
				// With Authentication setup, ensure that currentUser is the user creating the post

				console.log(ctx.photon.posts);

				const author = await ctx.photon.users.findOne({
					where: {
						email: authorEmail
					}
				});

				// console.log(author);

				const newPost = await ctx.photon.posts.create({
					data: {
						title,
						content,
						author: {
							connect: { email: authorEmail }
						}
					}
				});

				// console.log(newPost);

				await ctx.pubsub.publish('POST_PUSH', {
					newPost
				});

				return newPost;
			}
		});
	}
});

export const Subscription = objectType({
	name: 'Subscription',
	definition(t) {
		t.field('newPost', {
			type: 'Post',
			args: {
				author: stringArg({ required: false })
			},
			subscribe: withFilter((parent, args, ctx) => {
				const ret = ctx.pubsub.asyncIterator('POST_PUSH');
				console.log(ret);
				return ret;
			}, (payload, args) => true)
			// resolve: (parent, args, ctx, info) => console.log('sent')
		});
	}
});

export const Post = objectType({
	name: 'Post',
	definition(t) {
		t.model.id();
		t.model.createdAt();
		t.model.updatedAt();
		t.model.published();
		t.model.title();
		t.model.content();
		t.model.author();
	}
});

export const ChatMessage = objectType({
	name: 'ChatMessage',
	definition(t) {
		t.model.id();
		t.model.chat();
		t.model.sender();
		t.model.content();
		t.model.createdAt();
		t.model.type();
	}
});

export const Chat = objectType({
	name: 'Chat',
	definition(t) {
		t.model.id();
		t.model.name();
		t.model.picture();
		t.model.members();
		t.model.owner();
		t.model.messages();
		t.model.createdAt();
		t.model.updatedAt();
	}
});

export const User = objectType({
	name: 'User',
	definition(t) {
		t.model.id();
		t.model.email();
		t.model.password();
		t.model.name();
		t.model.posts();

		t.model.username();
		t.model.picture();
		t.model.chats();
		t.model.chatsOwned();
		t.model.createdAt();
		t.model.updatedAt();
	}
});

export const userLoginPayload = objectType({
	name: 'userLoginPayload',
	definition: (t) => {
		t.field('user', {
			type: 'User'
		});
		t.string('token');
	}
});

export const userLogin = mutationField('userLogin', {
	type: userLoginPayload,
	args: {
		email: stringArg({ required: true }),
		password: stringArg({ required: true })
	},
	resolve: async (parent, { email, password }, { photon, currentUsers }, info) => {
		try {
			const user = await photon.users.findOne({
				where: {
					email
				}
			});
			var validpass = await bcrypt.compare(password, user.password);
			if (validpass) {
				const token = jwt.sign(user, config.jwt.JWT_SECRET);

				console.log(user);
				console.log(token);

				currentUsers[user.email] = true;

				return {
					user,
					token
				};
			} else {
				throw new Error('Credentials are wrong');
			}
		} catch (e) {
			console.log(e);
		}
	}
});

export const userRegister = mutationField('userRegister', {
	type: userLoginPayload,
	args: {
		email: stringArg({ required: true }),
		password: stringArg({ required: true }),
		name: stringArg(),
		username: stringArg({ required: true }),
		picture: stringArg()
	},
	resolve: async (parent, { email, password, name, username, picture }, { photon, currentUsers }) => {
		try {
			let existingUser = await photon.users.findOne({
				where: {
					email
				}
			});

			if (existingUser) {
				throw new Error('ERROR: Username already used.');
			}

			existingUser = await photon.users.findOne({
				where: {
					username
				}
			});

			if (existingUser) {
				throw new Error('ERROR: Username already used.');
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			const user = await photon.users.create({
				data: {
					name,
					email,
					password: hashedPassword,
					picture,
					username
				}
			});

			// const token = jwt.sign(register, config.jwt.JWT_SECRET);

			const token = jwt.sign(
				{
					id: user.id,
					email: user.email
				},
				config.jwt.JWT_SECRET,
				{
					expiresIn: '30d'
				}
			);

			console.log(user);
			console.log(token);

			currentUsers[user.email] = true;

			return {
				user,
				token
			};
		} catch (e) {
			console.log(e);
			return null;
		}
	}
});
