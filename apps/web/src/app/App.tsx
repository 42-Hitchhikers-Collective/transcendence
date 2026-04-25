import "./App.css";
import { AppRouter } from "./router/AppRouter.tsx";
import { AuthProvider } from "./auth/AuthContext.tsx";

function App() {
  return (
    <AuthProvider>
      {/* 
      We wrap AuthProvider around Approuter
      so that it can read the AuthContext
      that lives inside it
      */} 
      <AppRouter /> 
    </AuthProvider>
  );
}

export default App;
