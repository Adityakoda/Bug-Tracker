
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/createProject.css";
import { useAuth } from "../context/AuthContext";

export default function CreateProject() {
  const navigate = useNavigate();
const { user } = useAuth();
const [role, setRole] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  
  const handleCreate = async () => {
    console.log("Current User:", user);


    if (!projectName || !projectDesc) {
      alert("Project name and description required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/projects",
        {
          user_id: user.id,        
          name: projectName,
          description: projectDesc
        }
      );
      navigate(`/project/${res.data.id}`, {
        state: {
          projectName: res.data.name,
          projectDesc: res.data.description
        }
      });

    } catch (err) {
      console.error(err);
      alert("Project creation failed");
    }
  }; 
  useEffect(() => {
  if (!user) return;

  const fetchRole = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/projects/${user.id}/role`
      );
      setRole(res.data.role);
    } catch (err) {
      console.error(err);
    }
  };

  fetchRole();
}, [user]);

  return (
    <div className="create-project-page"
       onClick={() => navigate("/welcome")}>
    
      <div className="create-project-card"
        onClick={(e) => e.stopPropagation()}>
      
        <div className="dashboard-brand2">
    <h1 className="brand-title2">Gradious</h1>
    <p className="brand-subtitle2">Bug Tracker</p>
    
  </div>


        <h2>Hello {user?.username}, Create a Project</h2>

        <div className="input-group">
          <label>Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <input
            type="text"
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
          />
        </div>

        <button className="create-btn" onClick={handleCreate}>
          Create
        </button>
      </div>
    </div>
  );
}
