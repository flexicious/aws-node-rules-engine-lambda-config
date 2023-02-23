import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Authenticator, SelectField } from '@aws-amplify/ui-react';
import { App } from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Authenticator loginMechanisms={["email"]} signUpAttributes={["email", "birthdate", "gender", "name"]}
      components={{
        SignUp: {
          FormFields() {
            return (
              <>
                <Authenticator.SignUp.FormFields />
                {/* gender selection*/}
                <SelectField name="gender" label="Gender" options={["Female", "Male"]}>
                </SelectField>
              </>
            );
          },
        },
      }}
    >
      {({ signOut, user }) => (
        <App signOut={()=>signOut?.()} user={user} />
      )}

    </Authenticator>
  </React.StrictMode>
);