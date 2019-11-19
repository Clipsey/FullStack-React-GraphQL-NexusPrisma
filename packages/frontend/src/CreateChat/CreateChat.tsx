import React, { useContext, useState } from 'react';
import { gql } from 'apollo-boost';
import { useMutation, useQuery } from '@apollo/react-hooks';
import idx from 'idx';
import styled from 'styled-components';
// import { space, layout, typography, color } from 'styled-system';

import { storeContext, StoreContext } from '../Store/Store';

interface User {
	email: string;
	username: String;
	id: string;
}

interface UserChecker {
	[key: string]: boolean;
}

const MUTATION = gql`
	mutation makeChat($name: String!, $ownerEmail: String!, $picture: String, $members: [String!]) {
		makeChat(name: $name, ownerEmail: $ownerEmail, picture: $picture, members: $members) {
			id
			members {
				username
				id
				email
			}
		}
	}
`;

const QUERY = gql`
	{
		users {
			username
			id
			email
		}
	}
`;

const FormContainer = styled.div({
	display: 'flex',
	'box-sizing': 'border-box',
	'align-items': 'center',
	'justify-content': 'space-around',
	width: '100%',
	height: '100%'
});

const Form = styled.form({
	display: 'flex',
	'align-items': 'center',
	'justify-content': 'center',
	'flex-direction': 'column',
	width: '50%'
});

const UserContainer = styled.div({
	height: '100%',
	width: '50%',
	display: 'flex',
	'flex-direction': 'column',
	'justify-content': 'space-around',
	'align-items': 'flex-start',
	overflow: 'auto'
});

const UserDiv = styled.div({
	display: 'flex',
	'justify-content': 'space-around',
	width: '100%',
	'min-height': '20%',
	overflow: 'auto',
	position: 'relative'
});

const InputButton = styled.input({
	position: 'absolute',
	right: '0px'
});

const BoldText = styled.p({
	'font-weight': 'bold'
});

const CreateChat = (props: any) => {
	const store = useContext<StoreContext>(storeContext);
	const currentUserEmail = idx(store, (_) => _.currentUser.email);
	const { refetchChats } = props;

	const UserCheckerDefault: UserChecker = {};
	const MembersDefault = [] as String[];

	const [ name, setName ] = useState('');
	const [ picture, setPicture ] = useState('');
	const [ members, setMembers ] = useState(MembersDefault);
	const [ memberChecker, setMemberChecker ] = useState(UserCheckerDefault);

	const usersResponse = useQuery(QUERY);
	const [ makeChat ] = useMutation(MUTATION, {
		onCompleted: (data) => {
			console.log(data);
			setMemberChecker(UserCheckerDefault);
			setMembers(MembersDefault);
			refetchChats();
		}
	});

	const newChat = (e: any) => {
		e.preventDefault();

		makeChat({
			variables: {
				name,
				picture,
				ownerEmail: currentUserEmail,
				members: [ ...members, currentUserEmail ]
			}
		});
	};

	const ToggleUser = (user: User) => {
		return () => {
			if (memberChecker[user.email] === true) {
				const oldMemberChecker = { ...memberChecker };
				oldMemberChecker[user.email] = false;

				const oldMembers = members.filter((email) => {
					return email !== user.email;
				});

				setMemberChecker(oldMemberChecker);
				setMembers(oldMembers);
			} else {
				const newMemberChecker = { ...memberChecker };
				newMemberChecker[user.email] = true;

				const newMembers = [ ...members, user.email ];

				setMemberChecker(newMemberChecker);
				setMembers(newMembers);
			}
		};
	};

	const usersData = idx(usersResponse, (_) => _.data.users);
	let UserDivs = <div />;
	if (usersData) {
		UserDivs = usersData.map((user: any) => {
			if (user.email === currentUserEmail) {
				return;
			}
			return (
				<UserDiv key={user.id}>
					{!memberChecker[user.email] && <p>{user.username}</p>}
					{!memberChecker[user.email] && <InputButton type="button" value="Add" onClick={ToggleUser(user)} />}

					{memberChecker[user.email] && <BoldText>{user.username}</BoldText>}
					{memberChecker[user.email] && (
						<InputButton type="button" value="Remove" onClick={ToggleUser(user)} />
					)}
				</UserDiv>
			);
		});
	}

	return (
		<FormContainer>
			<Form onSubmit={newChat}>
				<input type="text" placeholder="Chat Name" value={name} onChange={(e) => setName(e.target.value)} />
				<input
					type="text"
					placeholder="Picture Url"
					value={picture}
					onChange={(e) => setPicture(e.target.value)}
				/>
				<input type="submit" value="Create" />
			</Form>
			<UserContainer>{UserDivs}</UserContainer>
		</FormContainer>
	);
};

export default CreateChat;
