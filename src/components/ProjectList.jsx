import { useLocation, useNavigate } from "react-router-dom";
import "../styles/projectList.css";

export default function ProjectList() {
  const navigate = useNavigate();
  const { state } = useLocation();

  return (
    <div className="project-page">
      <h2>Projects</h2>

      {state && (
        <div className="project-card">
          <h3>{state.projectName}</h3>
          <p>{state.description}</p>
        </div>
      )}

      <button
        className="primary-btn"
        onClick={() => navigate("/create-project")}
      >
        Create New Project
      </button>
    </div>
  );
}
