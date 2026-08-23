import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const register = async (req, res) => {
  const client = await pool.connect();

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query("BEGIN");

    // 1. Создаём пользователя
    const userResult = await client.query(
      `
        INSERT INTO users (
          username,
          email,
          password
        )
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at
      `,
      [username.trim(), email.trim().toLowerCase(), hashedPassword],
    );

    const user = userResult.rows[0];

    // 2. Создаём персональную команду/workspace
    const teamResult = await client.query(
      `
        INSERT INTO teams (
          name
        )
        VALUES ($1)
        RETURNING
          id,
          name,
          created_at,
          updated_at
      `,
      [`${user.username}'s Workspace`],
    );

    const team = teamResult.rows[0];

    // 3. Добавляем пользователя владельцем команды
    await client.query(
      `
        INSERT INTO team_members (
          team_id,
          user_id,
          role
        )
        VALUES ($1, $2, 'owner')
      `,
      [team.id, user.id],
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "User registered successfully",
      user,
      team: {
        ...team,
        role: "owner",
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Register error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.trim().toLowerCase(),
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          username,
          email,
          created_at
        FROM users
        WHERE id = $1
      `,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get me error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { register, login, getMe };
