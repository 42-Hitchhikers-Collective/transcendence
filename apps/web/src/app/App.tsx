import "./App.css";
import { AppRouter } from "./router/AppRouter.tsx";
import { AuthProvider } from "./auth/AuthContext.tsx";

function App() {
  return (
    <AuthProvider>
      <AppRouter /> {/*  */}
    </AuthProvider>
  );
}

export default App;
