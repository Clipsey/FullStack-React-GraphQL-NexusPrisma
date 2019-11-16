import * as path from 'path';
import { GraphQLServer, PubSub } from 'graphql-yoga';
import { makeSchema } from 'nexus';
import { nexusPrismaPlugin } from 'nexus-prisma';
import * as types from './types';
import { Photon } from '@generated/photon';

const photon = new Photon();
const pubsub = new PubSub();

const currentUsers = {};

new GraphQLServer({
	context: () => {
		return { photon, pubsub, currentUsers };
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
