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
		t.crud.chat();
		t.crud.chats();
		t.crud.chatMessages();
		t.crud.chatMessage();
	}
});

export const Mutation = mutationType({
	definition(t) {
		t.crud.createOneUser();
		t.crud.createOnePost();
		t.crud.deleteOneUser();
		t.crud.deleteOnePost();
		t.crud.createOneChat();
		t.crud.updateOneChat();
		t.crud.createOneChatMessage();

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

				const author = await ctx.photon.users.findOne({
					where: {
						email: authorEmail
					}
				});

				const newPost = await ctx.photon.posts.create({
					data: {
						title,
						content,
						author: {
							connect: { email: authorEmail }
						}
					}
				});

				await ctx.pubsub.publish('POST_PUSH', {
					newPost
				});

				return newPost;
			}
		});

		// model Chat {
		// 	id        String        @default(cuid()) @id
		// 	name      String?
		// 	picture   String?
		// 	members   User[]        @relation(name: "ChatMembers")
		// 	owner     User          @relation(name: "ChatAdmin")
		// 	messages  ChatMessage[]
		// 	createdAt DateTime      @default(now())
		// 	updatedAt DateTime      @updatedAt
		// }

		t.field('makeChat', {
			type: 'Chat',
			args: {
				ownerEmail: stringArg({ required: true }),
				name: stringArg(),
				picture: stringArg(),
				members: stringArg({ list: true })
			},
			resolve: async (parent, { ownerEmail, name, picture, members }, ctx, info) => {
				const connector = members.map((email) => ({
					email: email
				}));

				const newChat = await ctx.photon.chats.create({
					data: {
						name,
						picture,
						owner: {
							connect: { email: ownerEmail }
						},
						members: {
							connect: connector
						}
					}
				});

				return newChat;
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
		t.model.messages({ ordering: true });
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
		t.model.chats({ ordering: true });
		t.model.chatsOwned({ ordering: true });
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
	resolve: async (parent, { email, password }, ctx, info) => {
		try {
			const user = await ctx.photon.users.findOne({
				where: {
					email
				}
			});
			ctx.claims = '';
			var validpass = await bcrypt.compare(password, user.password);
			if (validpass) {
				const token = jwt.sign(
					{
						id: user.id,
						email: user.email,
						claims: {
							isLoggedIn: true
						}
					},
					'ryansabik'
				);

				return {
					user,
					token: JSON.stringify(token)
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
	resolve: async (parent, { email, password, name, username, picture }, { photon }) => {
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
					email: user.email,
					claims: {
						isLoggedIn: true
					}
				},
				// config.jwt.JWT_SECRET,
				'ryansabik'
			);

			return {
				user,
				token: JSON.stringify(token)
			};
		} catch (e) {
			console.log(e);
			return null;
		}
	}
});
