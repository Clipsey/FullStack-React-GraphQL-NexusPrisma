import * as path from 'path';
import { GraphQLServer, PubSub } from 'graphql-yoga';
import { makeSchema } from 'nexus';
import { nexusPrismaPlugin } from 'nexus-prisma';
import * as types from './types';
import { Photon } from '@generated/photon';
import { rule, shield, and, or, not } from 'graphql-shield';
import * as jwt from 'jsonwebtoken';
import config from './config';

const photon = new Photon();
const pubsub = new PubSub();

const getClaims = (req) => {
	let token;
	try {
		const tokenString = req.request.get('authorization').slice(1, -1);
		token = jwt.verify(tokenString, 'ryansabik');
	} catch (e) {
		console.log(e);
		return null;
	}

	console.log(token);
	return token.claims;
};

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
	// return ctx.claims['isLoggedIn'] === 'true';
	// console.log(ctx.claims);
	return ctx.claims['isLoggedIn'] === true;
});

const chatUpdate = rule()(async (parent, args, ctx, info) => {
	// Creating a Chat has no rules other than being logged in
	// Updating a Chat, user has to be owner
	console.log(args, info);
	return true;
});

const permissions = shield({
	Query: {
		posts: and(isAuthenticated),
		chats: and(isAuthenticated)
	},
	Mutation: {
		makeChat: and(isAuthenticated),
		makePost: and(isAuthenticated),
		createOneUser: and(isAuthenticated),
		deleteOneUser: and(isAuthenticated),
		deleteOnePost: and(isAuthenticated),
		createOneChat: and(isAuthenticated),
		updateOneChat: and(isAuthenticated, chatUpdate),
		createOneChatMessage: and(isAuthenticated)
	}
});

new GraphQLServer({
	middlewares: [ permissions ],
	context: (req) => {
		return { ...req, photon, pubsub, claims: getClaims(req) };
	},
	schema: makeSchema({
		types,
		plugins: [ nexusPrismaPlugin() ],
		outputs: {
			typegen: path.join(__dirname, '../node_modules/@types/nexus-typegen/index.d.ts')
		}
	})
}).start((info) => {
	console.log(`server start on ${info.port}`);
});
