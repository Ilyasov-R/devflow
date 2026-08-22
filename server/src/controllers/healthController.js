import pool from '../config/db.js';

const healthCheck = async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      status: 'OK',
      message: 'DevFlow API is running',
      database: result.rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);

    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
    });
  }
};

export { healthCheck };