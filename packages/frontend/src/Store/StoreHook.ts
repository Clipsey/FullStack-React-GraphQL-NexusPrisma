import React from 'react';

import { StoreContext } from './Store';

export const useStore = (): StoreContext => {
	const [ currentUser, setCurrentUser ] = React.useState(null);
	const setUser = React.useCallback((user: any): void => {
		setCurrentUser(user);
	}, []);

	return {
		currentUser,
		setUser
	};
};
