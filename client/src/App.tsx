import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "./app/hooks";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

import ProtectedRoute from "./components/ProtectedRoute";
import ToastContainer from "./components/ToastContainer";

import MainLayout from "./layouts/MainLayout";

import { getMe } from "./features/auth/authSlice";

function App() {
  const dispatch = useAppDispatch();

  const { token } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [token, dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer />

      <Routes>
        {/* Публичные страницы */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* Защищённые страницы */}

        <Route
          element={<ProtectedRoute />}
        >
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
