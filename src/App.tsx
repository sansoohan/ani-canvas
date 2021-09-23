import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AppStateProvider } from './providers/AppStateProvider';
import { AuthProvider } from './providers/AuthProvider';
import { NavProvider } from './providers/NavProvider';
import routes from './constants/routes';
import * as views from './views';
import { FirebaseProvider } from './providers/FirebaseProvider';
import { StyledApp } from './Styled';

const mapRouteToView = {
  default: {
    [routes.HOME]: views.Home,
    [routes.GALLERY]: views.Gallery,
  },
}

function App() {
  return (
    <StyledApp>
      <Router>
        <AppStateProvider>
          <FirebaseProvider>
            <AuthProvider>
              <NavProvider>
                <Switch>
                  {Object.entries(mapRouteToView.default).map(([path, component]) => (
                    <Route component={component} exact key={path} path={path} />
                  ))}
                </Switch>
              </NavProvider>
            </AuthProvider>
          </FirebaseProvider>
        </AppStateProvider>
      </Router>
    </StyledApp>
  );
}

export default App;
