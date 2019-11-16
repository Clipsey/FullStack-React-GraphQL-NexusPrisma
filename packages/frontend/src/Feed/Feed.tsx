import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { gql } from 'apollo-boost';
import { useMutation, useSubscription, useQuery } from '@apollo/react-hooks';
import idx from 'idx';

import { storeContext } from '../Store/Store';
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

const postStyle = {
	margin: '10px',
	scroll: 'overflow',
	height: '50px'
};

const containerStyle = {
	height: '100%',
	width: '100%',
	display: 'flex',
	scroll: 'overflow',
	justifyContent: 'space-around'
};

const postsContainerStyle = {
	overflow: 'scroll',
	height: '100%'
};

const Feed = (): JSX.Element => {
	let store = useContext<any>(storeContext);

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
		onCompleted: (data) => {
			console.log(data);
		},
		onError: (err) => {
			console.log(err);
		}
	});
	const queryRet = useQuery(QUERY);
	const subRet = useSubscription(SUBSCRIPTION, {
		variables: { author: 'email' },
		onSubscriptionData: (data2) => {
			console.log(data2);
			//Remake query if posts don't come in?
			// TODO: Figure out why empty data comes in subscription?
			// Research:
			// 1) Subscriptions aren't fully implemented in prisma2
			// 2) pubsub module to work around
			// 3) Subscription with same query works in playground
			// 	3a) Maybe @apollo/react-hooks isn't implemented right?
			// 4) Try outdated react-apollo-hooks ?
			queryRet.refetch();
		},
		onSubscriptionComplete: () => {
			console.log('Subscribed');
		}
	});

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

	const testClick = () => {
		console.log(subRet.data);
		console.log(subRet.loading);
		console.log(subRet.error);

		console.log(queryRet.data.posts);
		console.log(postsDivs);
	};

	const handleSubmit = (e: any) => {
		e.preventDefault();
		// const authorEmail = idx(store, (_) => _.currentUser.email);
		const authorEmail = store.currentUser.email;
		console.log(authorEmail);

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
