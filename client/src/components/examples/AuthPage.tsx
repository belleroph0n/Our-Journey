import AuthPage from '../AuthPage';

export default function AuthPageExample() {
  return (
    <AuthPage 
      onAuthenticate={(rememberDevice) => {
        console.log('Authenticated, remember device:', rememberDevice);
      }} 
    />
  );
}
