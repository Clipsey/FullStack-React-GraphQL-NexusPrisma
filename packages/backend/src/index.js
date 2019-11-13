const { GraphQLServer } = require('graphql-yoga');

const typeDefs = `
type Query {
	info: String!
	feed: [Link!]!
}

type Mutation {
	post(url: String!, description: String!): Link!
}

type Link {
	id: ID!
	description: String!
	url: String!
}
`;

let links = [
	{
		id: 'link-0',
		url: 'www.howtographql.com',
		description: 'Fullstack tutorial for GraphQL'
	}
];

const resolvers = {
	Query: {
		info: () => `This is the API of a Hackernews Clone`,
		feed: () => links
	},
	Link: {
		id: (parent) => parent.id,
		description: (parent) => parent.description,
		url: (parent) => parent.url
	}
};

const server = new GraphQLServer({
	typeDefs,
	resolvers
});
server.start(() => console.log(`Server is running on `));
