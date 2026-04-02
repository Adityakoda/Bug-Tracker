import { useNavigate } from "react-router-dom";
import "../styles/welcome.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Welcome() {

  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [manageMode, setManageMode] = useState(false);
  const [editingProject, setEditingProject] = useState(null); 
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [role, setRole] = useState("");

useEffect(() => {
  if (!user || projects.length === 0) return;

  const fetchRole = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/projects/${projects[0].id}/role/${user.id}`
      );
      setRole(res.data.role);
    } catch (err) {
      console.error(err);
    }
  };

  fetchRole();
}, [user, projects]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/projects/${user.id}`
        );
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);


 const deleteProject = async (projectId) => {
  try {
    await axios.delete(
      `http://localhost:5000/projects/${projectId}`
    );

    setProjects(prev =>
      prev.filter(project => project.id !== projectId)
    );

    setDeleteProjectId(null);

  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};


  const saveEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/projects/${editingProject.id}`,
        {
          name: editingProject.name,
          description: editingProject.description
        }
      );

      setProjects(projects.map(p =>
        p.id === editingProject.id ? editingProject : p
      ));

      setEditingProject(null);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="welcome-page">

      <div className="left-section">
        <div className="dashboard-brand0">
            <h2 className="brand-title0">Gradious</h2>
            <h6 className="brand-subtitle0">Bug Tracker</h6>
            <h6 className="brand-tagline0">
                  Track. Manage. Resolve.
                </h6>
  </div>

        <h1>Hello {user?.username},</h1>
        <p className="subtitle">
          Manage your projects and track issues efficiently.
        </p>
       {role === "tester" && (
        <button
          className="primary-btn"
          onClick={() => navigate("/create-project")}
        >
          + Create Project
        </button>
       )}
      </div>

      <div className="right-section">

        <div className="projects-header">
          <h2 className="projects-title">My Projects</h2>
     {role === "tester" && (
          <button
            className="manage-btn"
            onClick={() => setManageMode(!manageMode)}
          >
            {manageMode ? "Done" : "Manage Projects"}
          </button>
     )}
        </div>

        {projects.length === 0 ? (
          <div className="empty-box">
            <h3>No Projects Yet</h3>
            <p>Create your first project to get started.</p>
          </div>
        ) : (
          <div className="project-list">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => {
                  if (!manageMode) {
                    navigate(`/project/${project.id}`, {
                      state: {
                        projectName: project.name,
                        projectDesc: project.description
                      }
                    });
                  }
                }}
              >
                <h3>{project.name}</h3>
                <p>{project.description}</p>

                {manageMode && (
                  <div className="manage-actions">
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                      }}
                    >
                      Edit
                    </button>
 
                    <button
                      className="delete-btn"
                     onClick={(e) => {
  e.stopPropagation();
  setDeleteProjectId(project.id);
}}

                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editingProject && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Project</h3>

            <input
              value={editingProject.name}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  name: e.target.value
                })
              }
            />

            <textarea
              value={editingProject.description}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  description: e.target.value
                })
              }
            />
           


            <div className="modal-actions">
              <button onClick={() => setEditingProject(null)}>
                Cancel
              </button>

              <button className="primary-btn" onClick={saveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteProjectId && (
  <div className="modal-overlay">
    <div className="delete-modal">
      <h3>Delete Project?</h3>
      <p>This action cannot be undone.</p>

      <div className="modal-actions">
        <button
          className="cancel-btn"
          onClick={() => setDeleteProjectId(null)}
        >
          Cancel
        </button>

        <button
          className="danger-btn"
          onClick={() => deleteProject(deleteProjectId)}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
