import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/issueModal.css";

export default function IssueModal({ onClose, onSave }) {
const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  const projectId = location.pathname.split("/").pop();

  const [members, setMembers] = useState([]);

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    description: "",
    severity: "Medium",
    dueDate: "",
    image: null,
    assigned_to: ""
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/projects/${projectId}/members`
        );
        setMembers(res.data);
      } catch (err) {
        console.error("Members fetch failed:", err);
      }
    };

    if (projectId) {
      fetchMembers();
    }
  }, [projectId]);


  const submit = () => {
    if (!form.title || !form.tagline) {
      alert("Title and Tagline are required");
      return;
    }

    onSave(form);   
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Create Issue</h2>

        <div className="form-group">
          <label>Title</label>
          <input
            placeholder="Short issue title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Tagline</label>
          <input
            placeholder="One-line summary"
            value={form.tagline}
            onChange={(e) =>
              setForm({ ...form, tagline: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            placeholder="Detailed description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>


        <div className="form-group">
          <label>Assign To</label>

          <select
            value={form.assigned_to}
            onChange={(e) =>
              setForm({ ...form, assigned_to: e.target.value })
            }
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
        </div>

        <div className="form-group">
          <label>Severity</label>
          <select
            value={form.severity}
            onChange={(e) =>
              setForm({ ...form, severity: e.target.value })
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Attachment</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm({ ...form, image: e.target.files[0] })
            }
          />
        </div>

        <div className="modal-actions">
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>

          <button className="primary-btn" onClick={submit}>
            Create Issue
          </button>
        </div>
      </div>
    </div>
  );
}
