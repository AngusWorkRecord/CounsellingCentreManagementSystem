import { useContext } from 'react';
//
import { AuthContext } from './JwtContext';
// import { AuthContext } from './Auth0Context';
// import { AuthContext } from './FirebaseContext';
// import { AuthContext } from './AwsCognitoContext';

// ----------------------------------------------------------------------

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  context.user={UserFullName:"Demo Account",role:"Administrator",photoURL:"/logo/BodhiCounsellingLogo.png"}
  console.log("Dasdasdasda", context)
  
  if (!context) throw new Error('useAuthContext context must be use inside AuthProvider');

  return context;
};
