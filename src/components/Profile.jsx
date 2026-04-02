import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import axios from "axios";
import "../styles/profile.css";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
const [role, setRole] = useState("");
  const projectId = location.state?.projectId;
  const [members, setMembers] = useState([]);
const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: ""
  });

  const [shareEmail, setShareEmail] = useState("");
  const [loading, setLoading] = useState(false);
useEffect(() => {
  if (!projectId) return;

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

  fetchMembers();
}, [projectId]);


  const handleUpdate = () => {
    if (!form.username.trim()) {
      alert("Username cannot be empty");
      return;
    }

    setUser({ ...user, username: form.username });
    alert("Profile updated successfully");
  };

useEffect(() => {
  if (!projectId || !user) return;

  const fetchRole = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/projects/${projectId}/role/${user.id}`
      );
      setRole(res.data.role);
    } catch (err) {
      console.error(err);
    }
  };

  fetchRole();
}, [projectId, user]);
 const handleShare = async () => {
  if (!shareEmail) return alert("Enter email");

  try {
    await axios.post(
      `http://localhost:5000/projects/${projectId}/share`,
      { email: shareEmail }
    );

    alert("Access granted successfully");
    setShareEmail("");

    // Refresh members list
    const res = await axios.get(
      `http://localhost:5000/projects/${projectId}/members`
    );
    setMembers(res.data);

  } catch (err) {
    console.error(err);
    alert("Sharing failed");
  }
};



  return (
  <div className="profile-page">
      {/* <h5>Profile</h5> */}
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <div className="dashboard-sidebar">
        <h2>Dashboard</h2>

        <div
          className={activeTab === "profile" ? "active-menu" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </div>

        <div
          className={activeTab === "access" ? "active-menu" : ""}
          onClick={() => setActiveTab("access")}
        >
          Project Access
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-content">

        {activeTab === "profile" && (
          <div className="profile-container">
            <div className="profile-right">

              <div className="head0">
                <h3>Profile Settings</h3>

                
              </div>

              <div className="profile-form">

                <div className="input-group">
                  <label>Username</label>
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Email</label>
                  <input value={form.email} disabled />
                </div>

                <div className="input-group">
                  <label>Bio</label>
                  <textarea
                    placeholder="Write something about yourself..."
                    value={form.bio}
                    onChange={(e) =>
                      setForm({ ...form, bio: e.target.value })
                    }
                  />
                </div>

                <button
                  className="save-btn"
                  onClick={handleUpdate}
                >
                  Save Changes
                </button>
              </div>

            </div>
            <div className="profile-left">
              <button
                  className="back-btn2"
                  onClick={() => navigate(-1)}
                >
                  Back
                </button>
              <div className="profile-avatar-large">
                {user?.username?.charAt(0).toUpperCase()}
              </div>

              <h2>{user?.username}</h2>
              <p>{user?.email}</p>

              {role && (
                <p className="user-role">
                  {role === "tester" ? "Role - Tester" : "Role - Developer"}
                </p>
              )}

              <button
                className="logout-btn"
                onClick={() => {
                  setUser(null);
                  navigate("/");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* ================= PROJECT ACCESS ================= */}
        {activeTab === "access" && (
          <div className="profile-container">
            <div className="profile-right" style={{ width: "100%" }}>

              <h3 style={{ color: "white" }}>Project Access</h3>

              {/* SHARE */}
              {projectId && role === "tester" && (
                <>
                  <div className="share-box">
                    <input
                      placeholder="Enter user email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />

                    <button onClick={handleShare} disabled={loading}>
                      {loading ? "Granting..." : "Grant Access"}
                    </button>
                  </div>

                  <hr />
                </>
              )}

              {/* MEMBERS */}
              <h3 style={{ color: "white" }}>Users with Access</h3>

              {members.length === 0 ? (
                <p style={{ color: "white" }}>No users have access yet.</p>
              ) : (
                <div className="access-list">
                  {members.map(member => (
                    <div key={member.id} className="access-item">
                      <strong>{member.username}</strong>
                      <p>{member.email}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  </div>
);
}
