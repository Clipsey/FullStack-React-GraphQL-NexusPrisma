import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect, withRouter, Switch } from 'react-router-dom';
import AuthForms from '../AuthForms/AuthForms';
import { storeContext } from '../Store/Store';
import Feed from '../Feed/Feed';
import Chat from '../Chat/Chat';

const Routing = (): JSX.Element => {
	let store = useContext(storeContext);

	console.log(store);

	// const flexStyle = {
	// 	display: 'flex',
	// 	flexDirection: 'column',
	// 	height: '100%',
	// 	width: '100%'
	// } as React.CSSProperties;

	const linkContainerStyles = {
		margin: '10px',
		width: '150px',
		display: 'flex',
		justifyContent: 'space-between',
		position: 'absolute',
		left: '0',
		top: '-5vh'
	} as React.CSSProperties;

	// let AuthRoute;
	// if (store.currentUser == null) {
	// 	console.log(store.currentUser == null);
	// 	AuthRoute = <Redirect to="/login" />;
	// }

	return (
		// <div style={flexStyle}>
		<Router>
			{store.currentUser == null && <Redirect to="/login" />}
			<div style={linkContainerStyles}>
				{store.currentUser == null && <Link to="/login">Log In</Link>}
				{store.currentUser == null && <Link to="/signup">Sign up</Link>}
				{store.currentUser && <Link to="/feed">Feed</Link>}
				{store.currentUser && <Link to="/chat">Chat</Link>}
			</div>
			<Switch>
				<Route exact path="/login" component={AuthForms} />
				<Route exact path="/signup" component={AuthForms} />
				<Route path="/feed" component={Feed} />
				<Route path="/chat" component={Chat} />
			</Switch>
		</Router>
		// </div>
	);
};

export default Routing;
