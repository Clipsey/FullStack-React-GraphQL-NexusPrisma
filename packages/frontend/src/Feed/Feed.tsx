import React, { useContext, useState } from 'react';
import { gql } from 'apollo-boost';
import { useMutation, useSubscription, useQuery, useLazyQuery } from '@apollo/react-hooks';
import idx from 'idx';

import { storeContext, StoreContext } from '../Store/Store';
import EditPost from '../EditPost/EditPost';

interface User {
	email: String;
	username: String;
}

interface Post {
	title: String;
	content: String;
	id: any;
	author: User;
}

const containerStyle = {
	height: '100%',
	width: '100%',
	display: 'flex',
	justifyContent: 'space-around'
};

const postsContainerStyle = {
	overflow: 'auto',
	height: '100%'
};

const postStyle = {
	margin: '10px',
	height: '50px'
};

const Feed = (): JSX.Element => {
	const store = useContext<StoreContext>(storeContext);
	const currentUserEmail = idx(store, (_) => _.currentUser.email);

	const [ title, setTitle ] = useState('');
	const [ content, setContent ] = useState('');

	const SUBSCRIPTION = gql`
		subscription {
			newPost(author: "email") {
				content
			}
		}
	`;
	const QUERY = gql`
		{
			posts(orderBy: { createdAt: desc }) {
				id
				title
				content
				createdAt
				author {
					email
					username
				}
			}
		}
	`;
	const MUTATION = gql`
		mutation makePost($title: String!, $authorEmail: String!, $content: String!) {
			makePost(title: $title, authorEmail: $authorEmail, content: $content) {
				id
			}
		}
	`;

	// const SUBSCRIPTION = gql`
	// 	subscription newPost($author: String!) {
	// 		newPost(author: $author) {
	// 			content
	// 		}
	// 	}
	// `;

	const [ makePost ] = useMutation(MUTATION, {
		onCompleted: (_) => {
			setTitle('');
			setContent('');
		}
	});
	const queryRet = useQuery(QUERY);
	useSubscription(SUBSCRIPTION, {
		variables: { author: 'email' },
		onSubscriptionData: (data2) => {
			//Remake query if posts don't come in?
			// TODO: Figure out why empty data comes in subscription?
			// Research:
			// 1) Subscriptions aren't fully implemented in prisma2
			// 2) pubsub module to work around
			// 3) Subscription with same query works in playground
			// 	3a) Maybe @apollo/react-hooks isn't implemented right?
			// 4) Try outdated react-apollo-hooks ?
			queryRet.refetch();
		}
	});

	// setTimeout(() => method(), 2000);

	const postsData = idx(queryRet, (_) => _.data.posts);
	let postsDivs = <div />;
	if (postsData) {
		postsDivs = postsData.map((post: Post) => {
			if (post.author.email !== store.currentUser.email) {
				return (
					<div key={post.id} style={postStyle}>
						<h1>{post.author.username}</h1>
						<h3>{post.title}</h3>
						<p>{post.content}</p>
					</div>
				);
			} else {
				return <EditPost key={post.id} post={post} />;
			}
		});
	}

	const handleSubmit = (e: any) => {
		e.preventDefault();
		const authorEmail = currentUserEmail;

		makePost({
			variables: {
				title,
				content,
				authorEmail
			}
		});
	};

	return (
		<div style={containerStyle}>
			{/* <button onClick={testClick} /> */}
			<div style={postsContainerStyle}>{postsDivs}</div>
			<form onSubmit={handleSubmit}>
				<input type="text" placeholder="title" value={title} onChange={(e) => setTitle(e.target.value)} />
				<input type="text" placeholder="content" value={content} onChange={(e) => setContent(e.target.value)} />
				<input type="submit" value="Submit" />
			</form>
		</div>
	);
};

export default Feed;
