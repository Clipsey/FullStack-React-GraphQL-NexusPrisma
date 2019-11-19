import React from 'react';

// export interface StoreContext {}

export interface StoreContext {
	currentUser: any;
	setUser: (currentUser?: any) => void;
}

export const storeContext = React.createContext({
	currentUser: null,
	setUser: () => {}
});
