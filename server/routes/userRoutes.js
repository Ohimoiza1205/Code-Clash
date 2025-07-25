/**
 * User Routes
 * This file contains routes for user-related actions
 * These endpoints allow the frontend to interact with user data
 * - creating or updating a user from google OAuth login
 * - Updating user preferences
 * - Tracking user stats like wins, losses, and matches played
 * - Retrieving user data for profile views
 * authentication is handled in authRoutes.js
 */

const express = require("express");
const router = express.Router();

const { findOrCreateUser, updateUserPreferences, updateMatchStats, getUserStats } = require('../controllers/userController');

// Route to handle Google OAuth login
router.post('/auth/google', async (req, res) => {
    const { googleId } = req.body;

    try {
        const user = await findOrCreateUser(googleId);
        res.status(200).json({ id: user.id });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update user preferences
router.put('/update-preferences/:id', async (req, res) => {
    const { id } = req.params;
    const { language, difficulty } = req.body;
    try {
        const updatedUser = await updateUserPreferences(id, language, difficulty);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// this route will be used to retrieve user stats
router.get('/stats/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const userStats = await getUserStats(id);
        res.status(200).json(userStats);
    } catch (error) {
        console.error('Error retrieving user stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update match stats (wins, matches played)
router.put('/update-stats', async (req, res) => {
    const {userId, isWin} = req.body;

    // Update match stats based on the outcome of a match
    try {
        const updatedUser = await updateMatchStats(userId, isWin);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating match stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});