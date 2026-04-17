import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import IssueModal from "./IssueModal";
import axios from "axios";
import "../styles/projectDetails.css";

export default function ProjectDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const projectId = location.pathname.split("/").pop();
  const { projectName, projectDesc } = location.state || {};
const [showWorkflowMenu, setShowWorkflowMenu] = useState(false);

  const [issues, setIssues] = useState([]);
  const [activeIssue, setActiveIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTimelineInput, setShowTimelineInput] = useState(false);
  const [timelineText, setTimelineText] = useState(""); 
  const [previewImage, setPreviewImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [role, setRole] = useState("");
  useEffect(() => {
  const fetchRole = async () => {
    const res = await axios.get(
      `http://localhost:5000/projects/${projectId}/role/${user.id}`
    );

    setRole(res.data.role);
  };

  fetchRole();
}, [projectId, user.id]);

  const [filteredIssues, setFilteredIssues] = useState([]);
  const [filters] = useState({
  title: "",
  assigned_to: "",
  severity: "",
  status: ""
});
const [searchFilters, setSearchFilters] = useState({
  title: "",
  assigned_to: "",
  severity: "",
  status: ""
});

const handleWorkflowAction = async (action) => {
  if (!activeIssue) return;

  try {
    await axios.post(
      `http://localhost:5000/issues/${activeIssue.id}/comment`,
      {
        comment: action,
        author: user?.username
      }
    );

   let newStatus = activeIssue.status;

if (action === "Done") {
  newStatus = "CLOSED";
} 
else {

  // Prevent developers from reopening closed issues
  if (activeIssue.status === "CLOSED" && role !== "tester") {
    alert("Only the tester can reopen a closed issue.");
    return;
  }

  newStatus = "IN PROGRESS";
}
    // 3️⃣ Update status in DB
    await axios.put(
      `http://localhost:5000/issues/${activeIssue.id}/status`,
      { status: newStatus }
    );

    // 4️⃣ Update frontend state
    setIssues(prev =>
      prev.map(i =>
        i.id === activeIssue.id
          ? { ...i, status: newStatus }
          : i
      )
    );

    const commentsRes = await axios.get(
      `http://localhost:5000/issues/${activeIssue.id}/comments`
    );

    setActiveIssue(prev => ({
      ...prev,
      status: newStatus,
      timeline: commentsRes.data
    }));

    setShowWorkflowMenu(false);

  } catch (err) {
    console.error(err);
  }
};



  useEffect(() => {
  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/projects/${projectId}/members`
      );
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (projectId) fetchMembers();
}, [projectId]);

  useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setPreviewImage(null);
    }
  };

  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, []);
useEffect(() => {
  const fetchComments = async () => {
    if (!activeIssue) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/issues/${activeIssue.id}/comments`
      );

      setActiveIssue(prev => ({
        ...prev,
        timeline: res.data
      }));

    } catch (err) {
      console.error("Fetching comments failed", err);
    }
  };
  fetchComments();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeIssue?.id]);



  useEffect(() => {
  const fetchIssues = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/issues/${projectId}`
      );

      const normalized = res.data.map(issue => ({
        ...issue,
        timeline: issue.timeline || []
      }));

      setIssues(normalized);

    } catch (err) {
      console.error(err);
    }
  };

  fetchIssues();
}, [projectId]);


  const addIssue = async (form) => {
  try {

    let base64Image = null;

    if (form.image) {
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(form.image);
        reader.onload = () => resolve(reader.result);
      });
    }

    const res = await axios.post(
  "http://localhost:5000/issues",
  {
    project_id: projectId,
    title: form.title,
    description: form.description,
    severity: form.severity,
    due_date: form.dueDate,
    image: base64Image,
    assigned_to: form.assigned_to
  }
);


    const newIssue = {
      id: res.data.id,
      ...form,
      image: base64Image,
      status: "OPEN",
      timeline: [],
      createdAt: new Date().toLocaleString()
    };

    setIssues((prev) => [...prev, newIssue]);

    setActiveIssue(newIssue);

  } catch (err) {
    console.error(err);
    alert("Issue creation failed");
  }
};


  const addTimeline = async () => {
  if (!timelineText || !activeIssue) return;

  try {
    // 1️⃣ Add comment
    await axios.post(
      `http://localhost:5000/issues/${activeIssue.id}/comment`,
      {
        comment: timelineText,
        author: user?.username
      }
    );

    // 2️⃣ Re-fetch comments only
    const commentsRes = await axios.get(
      `http://localhost:5000/issues/${activeIssue.id}/comments`
    );

    // 3️⃣ Update timeline safely
    setActiveIssue(prev => ({
      ...prev,
      timeline: commentsRes.data
    }));

    setTimelineText("");
    setShowTimelineInput(false);

  } catch (err) {
    console.error(err);
  }
  if (activeIssue.status === "CLOSED" && role !== "tester") {
  alert("Only testers can reopen closed issues.");
  return;
}
};

useEffect(() => {
  if (
    !filters.title &&
    !filters.assigned_to &&
    !filters.severity &&
    !filters.status
  ) {
    setFilteredIssues([]);
  }
}, [filters]);

    const markFixed = async () => {
  if (!activeIssue) return;

  try {
    await axios.put(
      `http://localhost:5000/issues/${activeIssue.id}/status`,
      { status: "CLOSED" }
    );

    const updatedIssue = {
      ...activeIssue,
      status: "CLOSED"
    };

    setIssues(prev =>
      prev.map(i =>
        i.id === activeIssue.id ? updatedIssue : i
      )
    );

    setActiveIssue(updatedIssue);

  } catch (err) {
    console.error(err);
    alert("Failed to update status");
  }
}; 


const handleSearch = () => {
  const filtered = issues.filter(issue => {
    return (
      (searchFilters.title === "" ||
        issue.title.toLowerCase().includes(searchFilters.title.toLowerCase())) &&

      (searchFilters.assigned_to === "" ||
  issue.assigned_to === Number(searchFilters.assigned_to))
 &&

      (searchFilters.severity === "" ||
        issue.severity === searchFilters.severity) &&

      (searchFilters.status === "" ||
        issue.status === searchFilters.status)
    );
  });

  setFilteredIssues(filtered);
  setIsSearching(true);
};
const handleClear = () => {
  setSearchFilters({
    title: "",
    assigned_to: "",
    severity: "",
    status: ""
  });

  setFilteredIssues([]);
  setIsSearching(false);
//   console.log("Issue assigned_to:", issue.assigned_to);
// console.log("Filter assigned_to:", searchFilters.assigned_to);

};


// const handleClear = async () => {
//   setSearchFilters({
//     title: "",
//     assigned_to: "",
//     severity: "",
//     status: "" 
//   });

//   const res = await axios.get(
//     `http://localhost:5000/issues/${projectId}`
//   );

//   setFilteredIssues([]);
// };



 const confirmDelete = async () => {
  if (!activeIssue) return;

  try {
    await axios.delete(
      `http://localhost:5000/issues/${activeIssue.id}`
    );

    const updatedIssues = issues.filter(
      (issue) => issue.id !== activeIssue.id
    );

    setIssues(updatedIssues);
    setActiveIssue(null);
    setShowDeleteModal(false);

  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};


  return (
    <div className="project-wrapper">
      <div className="nav">
        <div className="dashboard-brand1">
      <h1 className="brand-title1">Gradious</h1>
      <p className="brand-subtitle1">Bug Tracker</p>
    </div>
        <div className="nav-right">
        <button
            className="back-btn"
            onClick={() => navigate("/welcome")}
          >
            Projects
          </button>
        <div
  className="profile-avatar"
  onClick={() =>
    navigate("/profile", {
      state: { projectId }
    })
  }
>
  {user?.username?.charAt(0).toUpperCase()}
  </div>
</div>

           
      </div>
      <div className="top-bar">
        <div>
          <h1>{projectName || "Untitled Project"}</h1>
          
          <p>{projectDesc || "No description provided"}</p>
        </div>
        

        <div className="top-actions">
          <button
            className="glass-btn"
            onClick={() => setShowModal(true)}
          >
            + Create Issue
          </button>   

          
          
        </div>
      </div>
      <div className="search-row">

  <input
    placeholder="Search by title"
    value={searchFilters.title}
    onChange={(e) =>
      setSearchFilters({ ...searchFilters, title: e.target.value })
    }
  />

  <select
    value={searchFilters.assigned_to}
    onChange={(e) =>
      setSearchFilters({ ...searchFilters, assigned_to: e.target.value })
    }
  >
    <option value="">Assigned To</option>
    {members.map(member => (
      <option key={member.id} value={member.id}>
        {member.id === user.id ? "Myself" : member.email}
      </option>
    ))}
  </select>

  <select
    value={searchFilters.severity}
    onChange={(e) =>
      setSearchFilters({ ...searchFilters, severity: e.target.value })
    }
  >
    <option value="">Severity</option>
    <option value="Low">Low</option>
    <option value="Medium">Medium</option>
    <option value="High">High</option>
  </select>

  <select
    value={searchFilters.status}
    onChange={(e) =>
      setSearchFilters({ ...searchFilters, status: e.target.value })
    }
  >
    <option value="">Status</option>
    <option value="OPEN">Open</option>
    <option value="IN PROGRESS">In Progress</option>
    <option value="CLOSED">Closed</option>
  </select>

  <button className="s-btn" onClick={handleSearch}>
    Search
  </button>

  {(searchFilters.title ||
    searchFilters.assigned_to ||
    searchFilters.severity ||
    searchFilters.status) && (
    <button className="clear-btn" onClick={handleClear}>
      Clear
    </button>
  )}
</div>



      <hr />

        <div className="board">
          <div className="issues">
            <h3>Issues</h3>

            {issues.length === 0 && (
              <p className="link">No issues yet</p>
            )}

            {(isSearching ? filteredIssues : issues).map((issue) => (

              <div
                key={issue.id}
                className={`issue-item ${
                  activeIssue?.id === issue.id ? "active" : ""
                }`}
               onClick={() => {
  if (activeIssue?.id === issue.id) {
    setActiveIssue(null);
  } else {
    setActiveIssue(issue);
  }

  setShowTimelineInput(false);
  setShowWorkflowMenu(false);
}}
              >
                <div className="issue-row">
                  <p className="issue-title">{issue.title}</p>
                  <span
                    className={`status-badge ${issue.status?.toLowerCase()}`}
                  >
                    {issue.status}
                  </span>
                  <p className="assigned-user">
    Assigned: {issue.assigned_name || "Unassigned"}
  </p>

                </div>

                <p className="issue-tagline">{issue.tagline}</p>
              </div>
            ))}
          </div>

          <div className="timeline">
            <h3>
  Timeline

  <span
    className="edit"
    onClick={() => setShowTimelineInput(true)}
  >
    ✎
  </span>

  
  <span
  className="workflow-toggle"
  onClick={() => {
    if (!activeIssue) return;
    setShowWorkflowMenu(prev => !prev);
  }}
>
  ▾
</span>

  {showWorkflowMenu && activeIssue && (
  <div className="workflow-menu">
    <div onClick={() => handleWorkflowAction("In Progress")}>
      In Progress
    </div>
    <div onClick={() => handleWorkflowAction("In Review")}>
      In Review
    </div>
    {activeIssue.status !== "CLOSED" && (
      <div onClick={() => handleWorkflowAction("Done")}>
        Done
      </div>
    )}
  </div>
)}
</h3>


            {showTimelineInput && activeIssue && (
              <div className="timeline-input">
                <textarea
                  placeholder="Add a comment..."
                  value={timelineText}
                  onChange={(e) => setTimelineText(e.target.value)}
                />

                <div className="timeline-actions">
                  <button className="primary-btn" onClick={addTimeline}>
                    Add
                  </button>
                  <button
                    className="cancel"
                    onClick={() => {
                      setShowTimelineInput(false);
                      setTimelineText("");
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {activeIssue?.timeline?.map((t) => (
    <div key={t.id} className="timeline-item">
      <p>{t.comment}</p>
      <small>
        {t.author} • {new Date(t.created_at).toLocaleString()}
      </small>
    </div>
  ))}
          </div>

          <div className="details">
            {activeIssue ? (
              <>
                <h2>{activeIssue.title}</h2>
                <p>{activeIssue.description}</p>
                <p>
  <b>Assigned To:</b>
</p>

<select
  value={activeIssue.assigned_to || ""}
  onChange={async (e) => {
  const newUserId = Number(e.target.value) || null;

  await axios.put(
    `http://localhost:5000/issues/${activeIssue.id}/assign`,
    { assigned_to: newUserId }
  );

  const selectedMember = members.find(
    m => m.id === newUserId
  );

  const updatedIssue = {
    ...activeIssue,
    assigned_to: newUserId,
   assigned_name: selectedMember
  ? selectedMember.username
  : null

  };

  setActiveIssue(updatedIssue);

  setIssues(prev =>
    prev.map(issue =>
      issue.id === activeIssue.id
        ? updatedIssue
        : issue
    )
  );
}}

>

  <option value="">Unassigned</option>

  {members.map(member => (
    <option key={member.id} value={member.id}>
      {member.id === user.id
        ? `Myself (${member.email})`
        : member.email}
    </option>
  ))}
</select>


                <p><b>Status:</b> {activeIssue.status}</p>
                <p><b>Severity:</b> {activeIssue.severity}</p>
                <p>
                <b>Due Date:</b>{" "}
                {activeIssue.due_date
    ? new Date(activeIssue.due_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "Not set"}
    </p>

              {activeIssue.image && (
    <img
      src={activeIssue.image}
      alt="attachment"
      className="issue-image"
      onClick={() => setPreviewImage(activeIssue.image)}
    />
  )}


{activeIssue.status !== "CLOSED" && (
  <button className="fixed-btn" onClick={markFixed}>
    Mark Fixed
  </button>
)}




                <button
                  className="delete-btn"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </button>
              </>
            ) : (
              <p className="muted">No issue selected</p>
            )}
          </div>
        </div>

        {showModal && (
          <IssueModal
            onClose={() => setShowModal(false)}
            onSave={addIssue}
          />
        )}

      {previewImage && (
    <div
      className="image-preview-overlay"
      onClick={() => setPreviewImage(null)}
    >
      <div
        className="image-preview-box"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="image-close-btn"
          onClick={() => setPreviewImage(null)}
        >
          ✕
        </button>

        <img src={previewImage} alt="Preview" />
      </div>
    </div>
  )}
  


        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Delete Issue?</h3>
              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-delete-btn"
                  onClick={confirmDelete}
                >
                  Yes Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
