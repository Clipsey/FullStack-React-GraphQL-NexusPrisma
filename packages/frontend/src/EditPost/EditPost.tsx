import React, { useContext, useState } from 'react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const postStyle = {
	margin: '10px',
	scroll: 'overflow',
	height: '50px',
	display: 'flex',
	flexDirection: 'column'
} as React.CSSProperties;

const editButton = {
	width: '0px',
	height: '0px',
	visibility: 'hidden'
} as React.CSSProperties;

const MUTATION = gql`
	mutation updatePost($title: String!, $content: String!, $id: String!) {
		updatePost(title: $title, content: $content, id: $id) {
			id
		}
	}
`;

const EditPost = (props: any) => {
	const post = props.post;

	const [ title, setTitle ] = useState(post.title);
	const [ content, setContent ] = useState(post.content);
	const [ editMode, setMode ] = useState(false);
	const [ editor ] = useMutation(MUTATION, {
		onCompleted: (data) => {
			console.log(data);
		},
		onError: (err) => {
			console.log(err);
		}
	});

	const editPost = (e: any) => {
		e.preventDefault();
		console.log('edit');
		console.log(post.id);
		editor({
			variables: {
				title,
				content,
				id: post.id
			}
		});
	};

	let element;
	if (editMode === false) {
		element = (
			<div key={post.id} style={postStyle}>
				<h1>{post.author.username}</h1>
				<h3>{post.title}</h3>
				<p>{post.content}</p>
			</div>
		);
	} else {
		element = (
			<form style={postStyle} onSubmit={editPost}>
				<h1>{post.author.username}</h1>
				<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
				<input type="text" value={content} onChange={(e) => setContent(e.target.value)} />
				<input type="submit" value="Submit" style={editButton} />
				{/* <input type="text">{post.content}</input> */}
			</form>
		);
	}

	return (
		<React.Fragment>
			<button onClick={() => setMode(!editMode)} />
			{element}
		</React.Fragment>
	);
};

export default EditPost;
