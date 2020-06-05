import React from 'react';
import {Route, BrowserRouter} from 'react-router-dom';

import Home from './pages/Home'
import CreatePoints from './pages/CreatePoint'

const Routes = () => {
    return(
        <BrowserRouter>
            <Route component={Home} exact path="/" />
            <Route component={CreatePoints} path="/cadastro" />
        </BrowserRouter>
    );
}

export default Routes;