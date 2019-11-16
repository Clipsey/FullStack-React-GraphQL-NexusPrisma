import React from 'react';
import './App.css';
import styled from 'styled-components';
import { space, layout, typography, color } from 'styled-system';

import { ApolloClient, ApolloLink } from 'apollo-boost';
import { onError } from 'apollo-link-error';
import { ApolloProvider } from '@apollo/react-hooks';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

import { InMemoryCache } from 'apollo-cache-inmemory';
import { BrowserRouter } from 'react-router-dom';
import Routing from '../Routing/Routing';
import { Link } from 'react-router-dom';

import { storeContext } from '../Store/Store';
import { useStore } from '../Store/StoreHook';

const httpLink = new HttpLink({
	uri: 'http://localhost:4000/'
});

const wsLink = new WebSocketLink({
	uri: `ws://localhost:4000/`,
	options: {
		reconnect: true
	}
});

const errorLink = onError(({ graphQLErrors }) => {
	if (graphQLErrors) graphQLErrors.map(({ message }) => console.log(message));
});

const link = split(
	// split based on operation type
	({ query }) => {
		const definition = getMainDefinition(query);
		return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
	},
	wsLink,
	httpLink
);

const cache = new InMemoryCache();
const client = new ApolloClient({
	cache,
	link: ApolloLink.from([ errorLink, link ])
});

const App = (): JSX.Element => {
	const store = useStore();

	console.log(store);

	const Box = styled.div(
		{
			width: '90%',
			height: '90%',
			borderRadius: '4px',
			border: '1px solid black',
			display: 'flex',
			position: 'relative',
			'box-sizing': 'border-box',
			'align-items': 'center',
			'justify-content': 'center',
			'align-self': 'center',
			'justify-self': 'center'
		},
		space,
		color,
		layout,
		typography
	);

	const TopDiv = styled.div({
		display: 'flex',
		'align-items': 'center',
		'justify-content': 'center',
		width: '100vw',
		height: '100vh'
	});

	return (
		<TopDiv>
			<storeContext.Provider value={store}>
				<BrowserRouter>
					<ApolloProvider client={client}>
						<Box>
							<Routing />
						</Box>
					</ApolloProvider>
				</BrowserRouter>
			</storeContext.Provider>
		</TopDiv>
	);
};

export default App;
