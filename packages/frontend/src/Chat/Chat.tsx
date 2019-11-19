import React, { useContext, useState } from 'react';
import { gql } from 'apollo-boost';
import { useMutation, useQuery } from '@apollo/react-hooks';
import idx from 'idx';
import styled from 'styled-components';
// import { space, layout, typography, color } from 'styled-system';

import { storeContext, StoreContext } from '../Store/Store';
// import { background } from 'styled-system';

interface User {
	email: String;
	username: String;
}

interface ChatInterface {
	id: string;
	members: [User];
	name: String;
	picture: String;
	owner: User;
}

interface ChatMessageInterface {
	id: string;
	chat: ChatInterface;
	sender: User;
	content: string;
}

const Container = styled.div({
	width: '100%',
	height: '100%',
	overflow: 'auto'
});

const MessageContainer = styled.div({
	height: '75%',
	width: '100%',
	overflow: 'auto'
});

const Message = styled.div({
	display: 'flex',
	'flex-direction': 'column',
	'align-items': 'center',
	'justify-content': 'center',
	width: '100%',
	height: '25%',
	'border-bottom': 'solid 1px grey'
});

const Form = styled.form({
	display: 'flex',
	'align-items': 'center',
	'justify-content': 'space-between',
	position: 'absolute',
	bottom: '0',
	height: '25%',
	width: '100%',
	'background-color': 'white',
	'border-top': 'solid 1px grey'
});

const UserContainer = styled.div({
	height: '100%',
	width: '50%',
	overflow: 'auto'
});

const UserDiv = styled.div({
	display: 'flex',
	'justify-content': 'space-between',
	width: '100%',
	'min-height': '30px',
	overflow: 'auto',
	position: 'relative'
});

const QUERY = gql`
	query chatMessages($chatId: ID!) {
		chat(where: { id: $chatId }) {
			messages(orderBy: { createdAt: desc }) {
				id
				sender {
					username
				}
				content
			}
		}
	}
`;

const QUERY_USERS = gql`
	{
		users {
			username
			id
			email
		}
	}
`;

const MUTATION = gql`
	mutation createOneChatMessage($content: String!, $authorEmail: String!, $chatId: ID!) {
		createOneChatMessage(
			data: {
				content: $content
				sender: { connect: { email: $authorEmail } }
				chat: { connect: { id: $chatId } }
			}
		) {
			id
			content
		}
	}
`;

const MUTATION_ADD_USER = gql`
	mutation updateOneChat($chatId: ID!, $addedUserEmail: String!) {
		updateOneChat(where: { id: $chatId }, data: { members: { connect: { email: $addedUserEmail } } }) {
			members {
				email
			}
		}
	}
`;

const Chat = (props: any) => {
	const store = useContext<StoreContext>(storeContext);
	const currentUserEmail = idx(store, (_) => _.currentUser.email);
	const chat = props.chat;

	const isMember = (email: String) => {
		return chat.members.some((member: any) => {
			return email === member.email;
		});
	};
	const [ message, setMessage ] = useState('');

	const usersResponse = useQuery(QUERY_USERS);
	const chatMessageResponse = useQuery(QUERY, {
		variables: { chatId: chat.id || '' }
	});
	const [ createOneChatMessage ] = useMutation(MUTATION, {
		onCompleted: (data) => {
			setMessage('');
			chatMessageResponse.refetch();
		}
	});
	const [ updateOneChat ] = useMutation(MUTATION_ADD_USER, {
		onCompleted: (data) => {
			console.log(data);
			chatMessageResponse.refetch();
		}
	});

	const inviteUser = (user: any) => {
		return () => {
			updateOneChat({
				variables: {
					chatId: chat.id,
					addedUserEmail: user.email
				}
			});
		};
	};

	const chatMessages = idx(chatMessageResponse, (_) => _.data.chat.messages) || [];
	const chatMessageDivs = chatMessages.map((chatMessage: ChatMessageInterface) => {
		return (
			<Message key={chatMessage.id}>
				<h1>{chatMessage.sender.username}</h1>
				<p>{chatMessage.content}</p>
			</Message>
		);
	});

	const newMessage = (e: any) => {
		e.preventDefault();
		createOneChatMessage({
			variables: {
				content: message,
				authorEmail: currentUserEmail,
				chatId: chat.id
			}
		});
	};

	const usersData = idx(usersResponse, (_) => _.data.users);
	let UserDivs = <div />;
	if (usersData) {
		UserDivs = usersData.map((user: any) => {
			if (user.email === currentUserEmail || isMember(user.email)) {
				return;
			}
			return (
				<UserDiv key={user.id}>
					<p>{user.username}</p>
					<input type="button" value="Invite User" onClick={inviteUser(user)} />
				</UserDiv>
			);
		});
	}

	return (
		<Container>
			<MessageContainer>{chatMessageDivs}</MessageContainer>
			<Form onSubmit={newMessage}>
				<input type="text" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
				<input type="submit" value="Send" />
				<UserContainer>{UserDivs}</UserContainer>
			</Form>
		</Container>
	);
};

export default Chat;
