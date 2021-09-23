import React from 'react';
import { generatePath, Redirect } from 'react-router-dom';
import routes from '../../constants/routes';
import { useAuth } from '../../providers/AuthProvider';

type Props = {};

const HomeRenderer: React.FC<Props> = () => {
  const { thisUser } = useAuth();

  if (thisUser) {
    return (<Redirect to={generatePath(routes.GALLERY, { userName: thisUser.name })}/>)
  }

  return (
    <></>
  )
}

export default HomeRenderer;
