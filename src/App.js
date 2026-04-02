import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Welcome from "./components/Welcome";
import CreateProject from "./components/CreateProject";
import ProjectDetails from "./components/ProjectDetails";
import Profile from "./components/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/welcome"
          element={
            <PrivateRoute>
              <Welcome />
            </PrivateRoute>
          }
        />

        <Route
          path="/create-project"
          element={
            <PrivateRoute>
              <CreateProject />
            </PrivateRoute>
          }
        />

        <Route
          path="/project/:id"
          element={
            <PrivateRoute>
              <ProjectDetails />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
