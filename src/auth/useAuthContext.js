import { useContext } from 'react';
//
import { AuthContext } from './JwtContext';
// import { AuthContext } from './Auth0Context';
// import { AuthContext } from './FirebaseContext';
// import { AuthContext } from './AwsCognitoContext';

// ----------------------------------------------------------------------

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  context.user={UserFullName:"Demo Account",role:"Administrator",photoURL:"https://businesseventssarawak.com/v3/wp-content/uploads/elementor/thumbs/BESarawak-Logo-Colour-ozvwuj1xngkg7b1xgdbv6rg3h83s38q8ium3dfedh4.jpg"}
  console.log("Dasdasdasda", context)
  
  if (!context) throw new Error('useAuthContext context must be use inside AuthProvider');

  return context;
};
