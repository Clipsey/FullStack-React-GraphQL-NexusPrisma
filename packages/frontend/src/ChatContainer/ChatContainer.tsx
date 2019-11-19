import React, { useContext, useState } from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import idx from 'idx';
import styled from 'styled-components';
// import { space, layout, typography, color } from 'styled-system';

import { storeContext, StoreContext } from '../Store/Store';
import Chat from '../Chat/Chat';
import CreateChat from '../CreateChat/CreateChat';

interface GQLData {
	data: any;
	refetch: () => {};
}

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

const Form = styled.div({
	display: 'flex',
	'align-items': 'center',
	'justify-content': 'space-between',
	position: 'absolute',
	bottom: '0',
	height: '33%',
	width: '100%',
	'background-color': 'white',
	'border-top': 'solid 1px grey'
});

const ChatsContainer = styled.div({
	display: 'flex',
	'align-items': 'flex-start',
	'justify-content': 'center',
	width: '80%',
	height: '80%',
	border: 'solid 1px grey',
	position: 'relative'
});

const LeftChatContainer = styled.div({
	width: '50%',
	height: '67%',
	overflow: 'auto'
});
const RightChatContainer = styled.div({
	width: '50%',
	height: '67%',
	overflow: 'auto',
	'border-left': 'solid 1px black'
});

const ChatPreview = styled.div({
	display: 'flex',
	'flex-direction': 'column',
	'align-items': 'center',
	'justify-content': 'center',
	width: '100%',
	height: '33%',
	'border-top': 'solid 1px black',
	cursor: 'pointer'
});

const QUERY_CHATS_OWNED = gql`
	query user($email: String!) {
		user(where: { email: $email }) {
			chatsOwned(orderBy: { createdAt: desc }) {
				id
				name
				picture
				owner {
					id
					username
					email
				}
				members {
					id
					username
					email
				}
			}
		}
	}
`;

const QUERY_CHATS_MEMBER = gql`
	query user($email: String!) {
		user(where: { email: $email }) {
			chats(orderBy: { createdAt: desc }) {
				id
				name
				picture
				owner {
					id
					username
					email
				}
				members {
					id
					username
					email
				}
			}
		}
	}
`;

const ChatContainer = (props: any) => {
	const store = useContext<StoreContext>(storeContext);
	const currentUserEmail = idx(store, (_) => _.currentUser.email);
	const [ displaySoloChat, setDisplay ] = useState(false);
	const [ selectedChat, setSelectedChat ] = useState();

	let route = props.location.pathname;
	if (!route.includes('id') && displaySoloChat === true) {
		setDisplay(false);
		setSelectedChat(null);
	}

	const selectChat = (chat: ChatInterface, displayStatus: boolean) => {
		return () => {
			setDisplay(displayStatus);
			setSelectedChat(chat);
			props.history.push(`/chat/id/${chat.id}`);
		};
	};

	let ownedChatResponse: GQLData, memberChatResponse: GQLData;
	ownedChatResponse = useQuery(QUERY_CHATS_OWNED, {
		variables: { email: currentUserEmail || '' }
	});
	memberChatResponse = useQuery(QUERY_CHATS_MEMBER, {
		variables: { email: currentUserEmail || '' }
	});

	const ownedChatsData = idx(ownedChatResponse, (_) => _.data.user.chatsOwned);
	let ownedChatsDivs = <div />;
	if (ownedChatsData && !displaySoloChat) {
		ownedChatsDivs = ownedChatsData.map((chat: ChatInterface) => {
			// console.log(chat);
			return (
				<ChatPreview key={chat.id} onClick={selectChat(chat, true)}>
					<h3>{chat.name}</h3>
					<p>{chat.owner.username}</p>
				</ChatPreview>
			);
		});
	}

	const memberChatsData = idx(memberChatResponse, (_) => _.data.user.chats);
	let memberChatsDivs = <div />;
	if (memberChatsData && !displaySoloChat) {
		memberChatsDivs = memberChatsData.map((chat: ChatInterface) => {
			return (
				<ChatPreview key={chat.id} onClick={selectChat(chat, true)}>
					<h3>{chat.name}</h3>
					<p>{chat.owner.username}</p>
				</ChatPreview>
			);
		});
	}

	const refetchChats = () => {
		ownedChatResponse.refetch();
		memberChatResponse.refetch();
	};

	return (
		<ChatsContainer>
			{displaySoloChat === true && <Chat chat={selectedChat} />}

			{displaySoloChat === false && (
				<React.Fragment>
					<LeftChatContainer>
						<h1>Owned Chats</h1>
						{ownedChatsDivs}
					</LeftChatContainer>
					<RightChatContainer>
						<h1>Member of Chats</h1>
						{memberChatsDivs}
					</RightChatContainer>
					<Form>
						<CreateChat refetchChats={refetchChats} />
					</Form>
				</React.Fragment>
			)}
		</ChatsContainer>
	);
};

export default ChatContainer;
