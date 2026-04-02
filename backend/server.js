    const express = require("express");
    const cors = require("cors");
    const bcrypt = require("bcrypt");
    const db = require("./db");
const nodemailer = require("nodemailer");

    const app = express();
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


    app.use(cors());
    app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));



    app.post("/signup", async (req, res) => {
      const { username, email, password } = req.body;

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.promise().query(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hashedPassword]
        );

        res.json({ message: "User registered successfully" });

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Signup failed" });
      }
    });


    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      try {
        const [users] = await db.promise().query(
          "SELECT * FROM users WHERE email = ?",
          [email]
        );

        if (users.length === 0) {
          return res.status(400).json({ message: "User not found" });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res.status(400).json({ message: "Wrong password" });
        }

        res.json({
          id: user.id,
          username: user.username,
          email: user.email
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
      }
    });

    app.post("/projects", async (req, res) => {
      const { user_id, name, description } = req.body;

      try {
       const [result] = await db.promise().query(
  "INSERT INTO projects (user_id, name, description) VALUES (?, ?, ?)",
  [user_id, name, description]
);

await db.promise().query(
  "INSERT INTO project_access (project_id, user_id, role) VALUES (?, ?, ?)",
  [result.insertId, user_id, "tester"]
);

        res.json({
          id: result.insertId,
          user_id,
          name,
          description
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Project creation failed" });
      }
    });


    app.get("/projects/:userId", async (req, res) => {
      const userId = req.params.userId;

      try {
        const [projects] = await db.promise().query(
          `
          SELECT p.*
          FROM projects p
          WHERE p.user_id = ?

          UNION

          SELECT p.*
          FROM projects p
          JOIN project_access pa ON p.id = pa.project_id
          WHERE pa.user_id = ?
          `,
          [userId, userId]
        );

        res.json(projects);

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Fetching projects failed" });
      }
    });

    app.post("/issues", async (req, res) => {
  const {
    project_id,
    title,
    description,
    severity,
    due_date,
    image,
    assigned_to
  } = req.body;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO issues 
      (project_id, title, description, severity, due_date, status, image, assigned_to) 
      VALUES (?, ?, ?, ?, ?, 'OPEN', ?, ?)`,
      [
        project_id,
        title,
        description,
        severity,
        due_date || null,
        image,
        assigned_to || null
      ]
    );

    res.json({ id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Issue creation failed" });
  }
});





   app.get("/issues/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const [issues] = await db.promise().query(
      `
      SELECT i.*, u.username AS assigned_name
      FROM issues i
      LEFT JOIN users u ON i.assigned_to = u.id
      WHERE i.project_id = ?
      `,
      [projectId]
    );

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});





    app.put("/issues/:id/assign", async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  try {
    await db.promise().query(
      "UPDATE issues SET assigned_to = ? WHERE id = ?",
      [assigned_to, id]
    );

    res.json({ message: "Assignment updated" });

  } catch (err) {
    res.status(500).json({ message: "Assignment failed" });
  }
});


    
    app.delete("/issues/:id", async (req, res) => {
      const { id } = req.params;

      try {
        await db.promise().query(
          "DELETE FROM issues WHERE id = ?",
          [id]
        );

        res.json({ message: "Issue deleted" });

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Delete failed" });
      }
    });


  app.post("/issues/:id/comment", async (req, res) => {
    const { id } = req.params;
    const { comment, author } = req.body;

    try {
      await db.promise().query(
        "INSERT INTO issue_comments (issue_id, comment, author) VALUES (?, ?, ?)",
        [id, comment, author]
      );

      res.json({ message: "Comment added" });

    } catch (err) {
      console.error("COMMENT ERROR:", err);
      res.status(500).json({ message: "Comment failed" });
    }
  });

  app.get("/issues/:id/comments", async (req, res) => {
    const { id } = req.params;

    try {
      const [comments] = await db.promise().query(
        "SELECT * FROM issue_comments WHERE issue_id = ? ORDER BY created_at DESC",
        [id]
      );

      res.json(comments);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Fetching comments failed" });
    }
  });
  app.delete("/projects/:id", async (req, res) => {
    const { id } = req.params;

    try {
      await db.promise().query("DELETE FROM projects WHERE id = ?", [id]);
      res.json({ message: "Project deleted" });
    } catch (err) {
      res.status(500).json({ message: "Delete failed" });
    }
  });

  app.put("/projects/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
      await db.promise().query(
        "UPDATE projects SET name = ?, description = ? WHERE id = ?",
        [name, description, id]
      );
      res.json({ message: "Project updated" });
    } catch (err) {
      res.status(500).json({ message: "Update failed" });
    }
  });
  app.get("/projects/:projectId/role/:userId", async (req, res) => {
  const { projectId, userId } = req.params;

  const [rows] = await db.promise().query(
    "SELECT role FROM project_access WHERE project_id = ? AND user_id = ?",
    [projectId, userId]
  );

  res.json(rows[0] || { role: "developer" });
});

app.post("/projects/:projectId/share", async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;

  try {
    // Find user
    const [users] = await db.promise().query(
      "SELECT id, username FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = users[0].id;
    const username = users[0].username;

    // Grant access
    await db.promise().query(
      "INSERT INTO project_access (project_id, user_id, role) VALUES (?, ?, 'developer')",
      [projectId, userId]
    );

    // Get project name
    const [projects] = await db.promise().query(
      "SELECT name FROM projects WHERE id = ?",
      [projectId]
    );

    const projectName = projects[0].name;

    // Send email
    await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: `You’ve been added to ${projectName} | Gradious`,
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Project Access Granted</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6fb; font-family: 'Segoe UI', Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Card -->
          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 12px 30px rgba(0,0,0,0.08);">

            <!-- Branding Header -->
            <tr>
              <td style="
                background:linear-gradient(135deg,#1e3a8a,#2563eb);
                padding:50px 40px 40px;
                text-align:left;
              ">

                <h1 style="
                  margin:0;
                  font-size:42px;
                  font-weight:800;
                  letter-spacing:-1px;
                  color:#ffffff;
                ">
                Gradious
                </h1>

                <h2 style="
                  margin:8px 0 0;
                  font-size:20px;
                  font-weight:600;
                  color:#e0e7ff;
                ">
                  Bug Tracker
                </h2>

                <p style="
                  margin:12px 0 0;
                  font-size:14px;
                  color:#e0e7ff;
                ">
                  Track. Manage. Resolve.
                </p>

              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">

                <h2 style="margin:0 0 15px; color:#111827;">
                  Hello ${username},
                </h2>

                <p style="color:#4b5563; font-size:15px; line-height:1.6;">
                  You have been granted access to the project:
                </p>

                <div style="
                  background:#eef2ff;
                  padding:16px;
                  border-radius:8px;
                  margin:20px 0;
                ">
                  <strong style="color:#1e40af; font-size:16px;">
                    ${projectName}
                  </strong>
                </div>
                <p style="color:#4b5563; font-size:15px;">
                  You can now log in and start collaborating with your team.
                </p>

                <div style="text-align:center; margin-top:30px;">
                  <a href="http://localhost:3000"
                    style="
                      background:#2563eb;
                      color:#ffffff;
                      padding:12px 28px;
                      text-decoration:none;
                      border-radius:8px;
                      font-size:14px;
                      font-weight:bold;
                      display:inline-block;
                    ">
                    Open Dashboard
                  </a>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="
                background:#f9fafb;
                padding:20px;
                text-align:center;
                font-size:12px;
                color:#6b7280;
              ">
                © ${new Date().getFullYear()} Gradious Bug Tracker  
                <br/>
                Professional Issue Management Platform
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `
});


    res.json({ message: "Access granted and email sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sharing failed" });
  }
});
app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      html: "<h1>Email working ✅</h1>"
    });

    res.send("Email sent successfully");
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).send("Email failed");
  }
});


app.get("/projects/:projectId/members", async (req, res) => {
  const { projectId } = req.params;

  try {
    const [members] = await db.promise().query(
      `
      SELECT u.id, u.email, u.username
      FROM users u
      WHERE u.id = (
        SELECT user_id FROM projects WHERE id = ?
      )

      UNION

      SELECT u.id, u.email, u.username
      FROM users u
      JOIN project_access pa ON pa.user_id = u.id
      WHERE pa.project_id = ?
      `,
      [projectId, projectId]
    );

    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetching members failed" });
  }
});


app.put("/issues/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.promise().query(
      "UPDATE issues SET status = ? WHERE id = ?",
      [status, id]
    );

    res.json({ message: "Status updated successfully" });

  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: "Status update failed" });
  }
});


app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
