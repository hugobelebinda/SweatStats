require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const connectDB = require("./Database/connect"); // Import the connection function
const User = require("./Database/User"); // Import the User model
const Activity = require("./Database/Activity"); // Import the Activity model

const app = express();
app.use(cors());
const PORT = 5000;

// 1. Connect to MongoDB immediately when server starts
connectDB();

// Step 1: Redirect user to Strava login
app.get("/auth", (req, res) => {
  const redirectUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=activity:read`;
  res.redirect(redirectUrl);
});

// Step 2: Handle redirect, exchange code, AND SAVE USER
app.get("/exchange_token", async (req, res) => {
  const { code } = req.query;

  try {
    // A. Exchange code for tokens
    const response = await axios.post("https://www.strava.com/oauth/token", null, {
      params: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      },
    });

    const { access_token, refresh_token, expires_at, athlete } = response.data;

    // B. Save or Update User in MongoDB
    // We use findOneAndUpdate with "upsert: true"
    // This means: "Find user by Strava ID. If found, update tokens. If not found, create new user."
    const user = await User.findOneAndUpdate(
      { stravaId: athlete.id }, // Search criteria
      {
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        profilePic: athlete.profile,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_at,
      },
      { new: true, upsert: true } // Options: return the new doc, create if missing
    );

    console.log(` User saved: ${user.firstName} ${user.lastName}`);

    // C. Redirect to Frontend (We'll update this later to handle sessions)
    // For now, we just show a success message
    res.redirect(`http://localhost:5173?stravaId=${user.stravaId}`);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error during authentication.");
  }
});

// Step 3: Fetch AND Save activities
app.get("/activities", async (req, res) => {
  const { stravaId } = req.query;

  if (!stravaId) return res.send("Missing ?stravaId= in URL.");

  try {
    // 1. Find the user so we can attach the activities to them
    const user = await User.findOne({ stravaId });
    if (!user) return res.status(404).send("User not found.");

    // 2. Fetch data from Strava
    const response = await axios.get("https://www.strava.com/api/v3/athlete/activities", {
      headers: { Authorization: `Bearer ${user.accessToken}` },
      params: { per_page: 30 }, // Fetch last 30 activities
    });

    const activities = response.data;

    // 3. Save each activity to MongoDB
    // We use a loop to process them one by one
    for (const activity of activities) {
      await Activity.findOneAndUpdate(
        { activityId: activity.id }, // Check if this specific run exists
        {
          user: user._id, // Link to our User
          activityId: activity.id,
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
          moving_time: activity.moving_time,
          start_date: activity.start_date,
          map_polyline: activity.map?.summary_polyline, // Safe navigation in case map is missing
        },
        { upsert: true, new: true } // Create if new, update if exists
      );
    }

    console.log(`Synced ${activities.length} activities for ${user.firstName}`);

    res.json(activities)

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error syncing activities.");
  }
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});