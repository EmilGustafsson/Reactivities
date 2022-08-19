import React, { useEffect } from 'react';
import { Container } from 'semantic-ui-react';
import NavBar from './NavBar';
import ActivityDashboard from '../../feature/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import { Route, Switch, useLocation } from 'react-router-dom';
import HomePage from '../../feature/home/homepage';
import ActivityForm from '../../feature/activities/form/ActivityForm';
import ActivityDetails from '../../feature/activities/details/ActivityDetails';
import TestErrors from '../../feature/errors/TestError';
import { ToastContainer } from 'react-toastify';
import NotFound from '../../feature/errors/NotFound';
import ServerError from '../../feature/errors/ServerError';
import { useStore } from '../stores/store';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';
import ProfilePage from '../../feature/profiles/ProfilePage';
import PrivateRoute from './PrivateRoute';

function App() {
  const location = useLocation();
  const {commonStore, userStore} = useStore();

  useEffect(() => {
    if (commonStore.token) {
      userStore.getUser().finally(() => commonStore.setAppLoaded());
    } else {
      commonStore.setAppLoaded();
    }
  }, [commonStore, userStore])

  if (!commonStore.appLoaded) return <LoadingComponent content='Loading app...' />
  return (
    <>
    <ToastContainer position='bottom-right' hideProgressBar/>
    <ModalContainer />
    <Route exact path='/' component={HomePage}/>
    <Route 
      path={'/(.+)'}
      render={() => (
        <>
          <NavBar />
          <Container style={{marginTop: '7em'}}>
            <Switch>
            <PrivateRoute exact path='/activities' component={ActivityDashboard}/>
            <PrivateRoute path='/activities/:id' component={ActivityDetails}/>
            <PrivateRoute key={location.key} path={['/createActivity', '/manage/:id']} component={ActivityForm}/>        
            <PrivateRoute path='/profiles/:username' component={ProfilePage}/>
            <PrivateRoute path='/errors' component={TestErrors}/>
            <Route path='/server-error' component={ServerError}/>
            <Route component={NotFound}/>
            </Switch>
          </Container>        
        </>
      )}
    >

    </Route>
    </>
  );
}

export default observer(App);