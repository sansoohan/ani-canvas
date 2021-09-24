
import React, { useContext, ReactNode } from 'react';

import { UserCredential } from 'firebase/auth';
import inputForm from '../helpers/toaster/form/inputForm';
import showError from '../helpers/toaster/message/showError';
import showInfo from '../helpers/toaster/message/showInfo';
import showSuccess from '../helpers/toaster/message/showSuccess';
import { useAuth } from '../providers/AuthProvider';

type Props = {
  children: ReactNode;
};

interface NavValue {

}

const NavContext = React.createContext<NavValue | null>(null);

export function useNav(): NavValue {
  const state = useContext(NavContext);

  if (!state) {
    throw new Error('useNav must be used within NavProvider');
  }

  return state;
}

export function NavProvider({ children }: Props) {
  const { thisUser } = useAuth();
  const {
    doSignInWithEmailAndPassword,
    doSignInWithGoogle,
    doCreateUserWithEmailAndPasswordAndName,
    checkUserEmailCollision,
    doSendEmailVerification,
    setUserCredential,
    doSignOut,
  } = useAuth();

  const handleSignUp = async (event: any) => {
    const res = await inputForm(
      {
        title: 'Sign Up',
        confirmButtonText: 'Confirm',
      },
      {
        name: {label: 'Name', value: '' },
        email: {label: 'Email', value: '' },
        password: {label: 'Password', value: '', type: 'password' },
        passwordConfirm: {label: 'Password Confirm', value: '', type: 'password' },
      }
    );

    if (res?.value) {
      const {
        email,
        password,
        passwordConfirm,
        name,
      } = res?.value
  
      if (!email) {
        showError({
          title: 'Sign Up',
          text: 'Please insert Email Address',
        });
        return;
      }
  
      if (!password) {
        showError({
          title: 'Sign Up',
          text: 'Please insert Password',
        });
        return;
      }
  
      if (!passwordConfirm) {
        showError({
          title: 'Sign Up',
          text: 'Please insert Password Confirm',
        });
        return;
      }
  
      if (!name) {
        showError({
          title: 'Sign Up',
          text: 'Please insert Name',
        });
        return;
      }
  
      const isEmailValidationOk = /\w+@\w+\.?\w+/g.exec(email)?.index === 0
      if (!isEmailValidationOk) {
        showError({
          title: 'Sign Up',
          text: 'Email Format is wrong',
        });
        return;
      }

      if (password.length < 8 || password.length > 20) {
        showError({
          title: 'Sign Up',
          text: 'Please insert 8 ~ 20 Password',
        });
        return;
      }
  
      if (password !== passwordConfirm) {
        showError({
          title: 'Sign Up',
          text: 'Password Confirm does not match',
        });
        return;
      }
  
      try {
        const isEmailOk = await checkUserEmailCollision(email);
        if (!isEmailOk) {
          showError({
            title: 'Sign Up',
            text: 'Email Address is already registerd',
          });
          return;
        }
  
        await doCreateUserWithEmailAndPasswordAndName(email, name, password);
        await doSendEmailVerification();
        showInfo({
          title: 'Sign Up',
          text: `Please check ${email} and click confirm`,
        });
      } catch (error: any) {
        showError({
          title: 'Sign Up',
          text: error?.message,
        });
      }
    }
  }

  const handleSignOut = async (event: any) => {
    try {
      await doSignOut();
      showSuccess({
        title: 'Sign Out',
        text: `Bye`,
        timer: 1000,
      });
    } catch (error: any) {
      showError({
        title: 'Sign Out',
        text: error.message,
      });
    }
  }

  const handleSignIn = async (event: any) => {
    const res = await inputForm(
      {
        title: 'Sign In',
        confirmButtonText: 'Confirm',
        denyButtonText: 'Google Account'
      },
      {
        email: {label: 'Email', value: '' },
        password: {label: 'Password', value: '', type: 'password' },
      }
    )

    if (res.isDenied) {
      doSignInWithGoogle().then((
        userCredential?: UserCredential,
      ) => {
        showSuccess({
          title: 'Sign In',
          text: 'Hello!',
          timer: 1000,
        });

        if (userCredential) {
          setUserCredential(userCredential);
        }
      }).catch((error) => {
        showError({
          title: 'Sign In',
          text: error.message,
        });
      });
    } else if (res?.value) {
      const { email, password } = res?.value;

      if (!email) {
        showError({
          title: 'Sign In',
          text: 'Please insert Email Address',
        })
        return;
      }
  
      if (!password) {
        showError({
          title: 'Sign In',
          text: 'Please insert Password',
        })
        return;
      }

      doSignInWithEmailAndPassword(email, password).then((
        userCredential?: UserCredential,
      ) => {
        showSuccess({
          title: 'Sign In',
          text: `Hello!`,
          timer: 1000,
        });
  
        if (userCredential) {
          setUserCredential(userCredential);
        }

        
      }).catch((error) => {
        showError({
          title: 'Sign In',
          text: error.message,
        });
      });
    }

    event.preventDefault();
  }

  const providerValue = {

  };

  return (
    <NavContext.Provider value={providerValue}>
      <nav className='navbar navbar-expand-lg navbar-light bg-light'>
        <div className='container'>
          <span className='navbar-brand'>Animation Canvas</span>
          <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
            <span className='navbar-toggler-icon'></span>
          </button>
          <div className='collapse navbar-collapse' id='navbarSupportedContent'>
            <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
            </ul>

            <button
              className='btn btn-outline-success me-2'
              onClick={thisUser ? handleSignOut : handleSignIn}
            >{thisUser ? 'Sign Out' : 'Sign In'}</button>

            <button
              className='btn btn-outline-success'
              onClick={handleSignUp}
            >Sign Up</button>
          </div>
        </div>
      </nav>
      {children}
    </NavContext.Provider>
  )
}
