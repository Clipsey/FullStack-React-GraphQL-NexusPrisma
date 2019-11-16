import React, { useState, useContext } from 'react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import { space, layout, typography, color } from 'styled-system';
import { Redirect } from 'react-router';
import { render } from 'react-dom';

import { storeContext } from '../Store/Store';

// const TEST_QUERY = gql`
// 	{
// 		users {
// 			id
// 			password
// 			email
// 		}
// 	}
// `;

const LOGIN = gql`
	mutation userLogin($email: String!, $password: String!) {
		userLogin(email: $email, password: $password) {
			user {
				email
				username
			}
			token
		}
	}
`;

const REGISTER = gql`
	mutation userRegister($email: String!, $password: String!, $username: String!, $picture: String!, $name: String!) {
		userRegister(email: $email, password: $password, username: $username, picture: $picture, name: $name) {
			user {
				email
				username
			}
			token
		}
	}
`;

const LoginForm = (props) => {
	const { setUser } = useContext(storeContext);

	const [ password, setPassword ] = useState('');
	const [ email, setEmail ] = useState('');
	const [ name, setName ] = useState('');
	const [ username, setUsername ] = useState('');
	const [ picture, setPicture ] = useState('');
	const [ redirector, setRedirector ] = useState(null);

	let route = props.match.path;
	let mutationMethod;
	if (route === '/login') {
		mutationMethod = LOGIN;
	} else {
		mutationMethod = REGISTER;
	}

	const [ method ] = useMutation(mutationMethod, {
		onCompleted: (data) => {
			console.log(data);

			// setPassword('');
			// setEmail('');
			// setName('');
			// setUsername('');
			// setPicture('');

			setRedirector(<Redirect to="/feed" />);

			if (route === '/login') {
				setUser(data.userLogin.user);
			} else {
				setUser(data.userRegister.user);
			}
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		method({
			variables: {
				email,
				password,
				name,
				username,
				picture
			}
		});
	};

	const Box = styled.div(
		{
			width: '50%',
			height: '20%',
			display: 'flex',
			'box-sizing': 'border-box',
			'align-items': 'center',
			'justify-content': 'center',
			'flex-direction': 'column'
		},
		space,
		color,
		layout,
		typography
	);

	const boxStyle = {
		display: 'flex',
		boxSizing: 'border-box',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column'
	};

	return (
		<React.Fragment>
			{redirector}
			<form onSubmit={handleSubmit}>
				{/* <Box> */}
				<div style={boxStyle}>
					<input type="text" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
					<input
						type="text"
						placeholder="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					{route === '/signup' && (
						<input type="text" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
					)}
					{route === '/signup' && (
						<input
							type="text"
							placeholder="picture"
							value={picture}
							onChange={(e) => setPicture(e.target.value)}
						/>
					)}
					{route === '/signup' && (
						<input
							type="text"
							placeholder="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					)}

					<input type="submit" value="Submit" />
					{/* </Box> */}
				</div>
			</form>
		</React.Fragment>
	);
};

export default LoginForm;
