import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
    isAuthenticated: false
  });

  // default axios
  axios.defaults.headers.common['Authorization'] = auth?.token;


  useEffect(() => {
    const data = localStorage.getItem("hippo_admin_auth");
    if (data) {
      const parseData = JSON.parse(data);
      setAuth(prevAuth => ({
        ...prevAuth,
        user: parseData.user,
        token: parseData.token,
        isAuthenticated: true
      }));
    }
  }, []);  

  
  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };