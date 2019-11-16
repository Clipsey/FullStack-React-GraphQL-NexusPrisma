import { queryType, mutationType, objectType, mutationField, stringArg } from 'nexus';
import * as bcrypt from 'bcryptjs';
import * as jsonwebtoken from 'jsonwebtoken';

export const Query = queryType({
	definition(t) {
		t.crud.user();
		t.crud.users({ ordering: true });
		t.crud.post();
		t.crud.posts({ filtering: true });
	}
});

export const Mutation = mutationType({
	definition(t) {
		t.crud.createOneUser();
		t.crud.createOnePost();
		t.crud.deleteOneUser();
		t.crud.deleteOnePost();
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

// model User {
//   id         String   @default(cuid()) @id
//   email      String   @unique
//   password   String
//   name       String?
//   posts      Post[]
//   username   String?  @unique
//   picture    String?
//   chats      Chat[]   @relation(name: "ChatMembers")
//   chatsOwned Chat[]   @relation(name: "ChatAdmin")
//   createdAt  DateTime @default(now())
//   updatedAt  DateTime @updatedAt
// }

export const AuthLoad = objectType({
	name: 'AuthLoad',
	definition(t) {
		t.string('token');
		t.field('user', { type: 'User' });
	}
});

export const registerUser = mutationField('registerUser', {
	type: 'User',
	args: {
		email: stringArg(),
		password: stringArg(),
		name: stringArg(),
		username: stringArg(),
		picture: stringArg()
	},
	resolve: async (parent, { email, password, name, username, picture }, { photon }): Promise<any> => {
		let foundUser = await photon.users.findOne({
			where: {
				email
			}
		});

		if (foundUser !== null) {
			throw Error('Email is already in use.');
		}

		foundUser = await photon.users.findOne({
			where: {
				username
			}
		});

		if (foundUser !== null) {
			throw new Error('Username is already in use.');
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await photon.users.create({
			data: {
				name,
				email,
				password: hashedPassword,
				picture,
				username
			}
		});
		return newUser;
	}
});

export const loginUser = mutationField('loginUser', {
	type: 'AuthLoad',
	args: {
		email: stringArg(),
		password: stringArg()
	},
	resolve: async (parent, { email, password }, { photon }): Promise<any> => {
		const foundUser = await photon.users.findOne({
			where: {
				email
			}
		});

		if (foundUser === null) {
			throw new Error('User was not found, please try a different email.');
		}

		const validPassword = await bcrypt.compare(password, foundUser.password);

		if (validPassword === false) {
			throw new Error('Invalid credentials.');
		}

		const authToken = jsonwebtoken.sign(
			{
				id: foundUser.id,
				email: foundUser.email
			},
			'ryansabik_secretkey',
			{
				expiresIn: '30d'
			}
		);

		console.log({ foundUser, authToken });

		return { user: foundUser, token: authToken };
	}
});
