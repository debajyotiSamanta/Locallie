const express = require('express');
const router = express.Router();
const multer = require('multer');
const { User, Issue, Drive, AuditLog } = require('../db/models');
const {
  calculateDistance,
  autoCategorize,
  detectDuplicates,
  detectSeverity,
  detectFakeReport,
  calculatePriorityScore,
  improveDescription,
  runOCR,
  verifyImage,
  processChatbotQuery
} = require('../services/ai');
const { uploadBuffer, uploadBase64 } = require('../services/storage');

// Multer: store uploads in memory so we can convert to base64 and store in MongoDB
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images and videos are allowed'), false);
  }
});

// ----------------- UPLOAD ENDPOINT -----------------

// POST /api/upload — multipart file upload → base64 data URL stored in MongoDB
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await uploadBuffer(req.file.buffer, { mimetype: req.file.mimetype });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    });
  } catch (err) {
    console.error('[Storage] Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// Helper to update audit logs asynchronously
const logAction = async (user, action, details) => {
  try {
    await AuditLog.create({
      _id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user: user || "system",
      action,
      details
    });
  } catch (err) {
    console.error("Failed to write audit log to database:", err);
  }
};

// ----------------- AUTH ENDPOINTS -----------------

// Register
router.post('/auth/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ error: "Username or Email already registered" });
    }

    const newUser = await User.create({
      _id: `u_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      username,
      email,
      password, // Proto auth - stored as plain
      role,
      xp: 0,
      points: 0,
      badges: [],
      reputation: role === "Community Hero" ? "Novice Hero" : role === "NGO/Volunteer" ? "Initiator" : "Citizen"
    });

    await logAction(username, "USER_REGISTER", `Registered as ${role}`);

    res.json({
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        xp: newUser.xp,
        points: newUser.points,
        badges: newUser.badges,
        reputation: newUser.reputation
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    await logAction(user.username, "USER_LOGIN", "Logged into system");
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        xp: user.xp,
        points: user.points,
        badges: user.badges,
        reputation: user.reputation
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch User profile (Gamification info)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- ISSUES ENDPOINTS -----------------

// Get all issues
router.get('/issues', async (req, res) => {
  const { category, status, search, lat, lng, radius } = req.query;

  try {
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      const q = new RegExp(search, 'i');
      query.$or = [
        { title: q },
        { description: q },
        { address: q }
      ];
    }

    let list = await Issue.find(query);

    // GPS radius search
    if (lat && lng && radius) {
      const rLat = parseFloat(lat);
      const rLng = parseFloat(lng);
      const rRad = parseFloat(radius); // in meters
      list = list.filter(i => {
        const dist = calculateDistance(rLat, rLng, i.gps.lat, i.gps.lng);
        return dist <= rRad;
      });
    }

    // Sort by priorityScore descending
    list.sort((a, b) => b.priorityScore - a.priorityScore);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single issue
router.get('/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post issue
router.post('/issues', async (req, res) => {
  const { title, description, address, gps, image, isAnonymous, reporterName, reporterEmail, checkOnly = false } = req.body;
  if (!title || !description || !address || !gps) {
    return res.status(400).json({ error: "Title, description, address, and coordinates are required" });
  }

  try {
    // 1. AI Fake Report Check
    const fakeCheck = detectFakeReport(title, description);
    if (fakeCheck.isFake) {
      return res.status(400).json({
        error: "AI Moderation Rejected",
        reason: fakeCheck.reason
      });
    }

    // 2. AI Auto Categorization
    const category = autoCategorize(title, description);

    // 3. AI Severity Prediction
    const severity = detectSeverity(title, description, category);

    // 4. AI Duplicate Detection
    const allActiveIssues = await Issue.find({ status: { $ne: 'resolved' }, duplicateOf: null });
    const duplicates = detectDuplicates(gps.lat, gps.lng, category, allActiveIssues);

    // 5. OCR Simulation
    let ocrData = { houseNumber: "", roadName: "" };
    if (image) {
      ocrData = runOCR(image);
    }

    // 6. Image Verification Simulation
    let imgVerification = null;
    if (image) {
      imgVerification = verifyImage(image, category);
    }

    // If client only wanted pre-submission AI insights (dry-run)
    if (checkOnly) {
      return res.json({
        category,
        severity,
        duplicates,
        ocrData,
        imgVerification,
        improvedDescription: improveDescription(title, description, category)
      });
    }

    // Calculate base priority score
    const priorityScore = calculatePriorityScore(severity, 0, category);

    const reporterUser = await User.findOne({ email: reporterEmail });
    const reporterData = isAnonymous
      ? { username: "anonymous_resident", email: "anon@localfix.org" }
      : { username: reporterName || "citizen_user", email: reporterEmail || "user@example.com" };

    // Store image as base64 data URL in MongoDB
    let imageUrl = "";
    if (image && image.startsWith('data:')) {
      try {
        const uploadResult = await uploadBase64(image);
        imageUrl = uploadResult.secure_url;
        console.log('[Storage] Issue image stored as base64 data URL in MongoDB.');
      } catch (uploadErr) {
        console.error('[Storage] Failed to process image:', uploadErr.message);
        imageUrl = image; // fallback: store raw base64
      }
    } else if (image && image.startsWith('http')) {
      imageUrl = image; // already a URL (seed data etc.)
    }

    const newIssue = await Issue.create({
      _id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      description: improveDescription(title, description, category),
      category,
      address,
      gps,
      image: imageUrl,
      video: "",
      priority: severity === "Emergency" ? "High" : severity === "High" ? "High" : severity === "Medium" ? "Medium" : "Low",
      severity,
      status: "reported",
      reporter: reporterData,
      comments: [],
      upvotes: [],
      claimedBy: null,
      dateReported: new Date().toISOString(),
      dateClaimed: null,
      dateResolved: null,
      beforeImage: imageUrl || "",
      afterImage: "",
      isAnonymous: !!isAnonymous,
      department: category === "Road Damage" ? "Public Works Department"
                : category === "Sanitation" ? "Sanitation & Waste Management"
                : category === "Electrical" ? "Electrical Department"
                : category === "Water Leakage" ? "Water Supply & Sewage Board"
                : category === "Fallen Trees" ? "Parks & Forestry Department"
                : "General Administration",
      duplicateOf: duplicates.length > 0 ? duplicates[0].id : null,
      priorityScore
    });

    // Award reporter XP (15 points per valid report)
    if (reporterUser) {
      reporterUser.xp += 15;
      reporterUser.points += 10;
      
      if (!reporterUser.badges.includes("First Report")) {
        reporterUser.badges.push("First Report");
      }
      
      const reportsCount = await Issue.countDocuments({ "reporter.email": reporterEmail });
      if (reportsCount >= 4 && !reporterUser.badges.includes("Active Voice")) {
        reporterUser.badges.push("Active Voice");
      }
      await reporterUser.save();
    }

    await logAction(reporterData.username, "REPORT_ISSUE", `Reported '${title}' [Category: ${category}]`);

    res.json({
      success: true,
      issue: newIssue,
      aiResult: {
        category,
        severity,
        duplicateWarning: duplicates.length > 0,
        imgVerification,
        ocrData
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote issue
router.post('/issues/:id/vote', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID required" });

  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    const voteIndex = issue.upvotes.indexOf(userId);
    let voted = false;
    if (voteIndex > -1) {
      // Remove vote
      issue.upvotes.splice(voteIndex, 1);
    } else {
      // Add vote
      issue.upvotes.push(userId);
      voted = true;

      // Award XP to voter
      const user = await User.findById(userId);
      if (user) {
        user.xp += 2;
        user.points += 1;
        await user.save();
      }
    }

    // Recalculate priority score
    issue.priorityScore = calculatePriorityScore(issue.severity, issue.upvotes.length, issue.category);
    await issue.save();

    res.json({ upvotesCount: issue.upvotes.length, voted, priorityScore: issue.priorityScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Comment on issue
router.post('/issues/:id/comment', async (req, res) => {
  const { username, text } = req.body;
  if (!username || !text) return res.status(400).json({ error: "Username and comment text required" });

  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    const newComment = {
      _id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      username,
      text,
      date: new Date()
    };

    issue.comments.push(newComment);
    await issue.save();
    
    await logAction(username, "COMMENT_POST", `Commented on issue '${issue.title}'`);

    res.json({ comments: issue.comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Claim issue
router.post('/issues/:id/claim', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID required" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "Community Hero" && user.role !== "NGO/Volunteer") {
      return res.status(403).json({ error: "Only Community Heroes or NGOs can claim issues" });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });
    if (issue.status !== "reported") {
      return res.status(400).json({ error: "Issue is already claimed or resolved" });
    }

    issue.status = "claimed";
    issue.claimedBy = { id: user._id, username: user.username, role: user.role };
    issue.dateClaimed = new Date().toISOString();

    // Award XP for claim
    user.xp += 25;
    
    await issue.save();
    await user.save();
    
    await logAction(user.username, "CLAIM_ISSUE", `Claimed '${issue.title}'`);

    res.json({ issue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve issue
router.post('/issues/:id/resolve', async (req, res) => {
  const { userId, afterImage } = req.body;
  if (!userId || !afterImage) return res.status(400).json({ error: "User ID and resolution evidence image are required" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });
    if (issue.status !== "claimed") {
      return res.status(400).json({ error: "Issue must be claimed before it can be resolved" });
    }

    // Validate the claimer resolves it
    if (issue.claimedBy.id !== userId) {
      return res.status(403).json({ error: "You are not the hero who claimed this issue" });
    }

    // Store afterImage as base64 data URL in MongoDB
    let afterImageUrl = '';
    if (afterImage && afterImage.startsWith('data:')) {
      try {
        const uploadResult = await uploadBase64(afterImage);
        afterImageUrl = uploadResult.secure_url;
        console.log('[Storage] Resolution image stored as base64 data URL in MongoDB.');
      } catch (uploadErr) {
        console.error('[Storage] Failed to process resolution image:', uploadErr.message);
        afterImageUrl = afterImage; // fallback: store raw base64
      }
    } else {
      afterImageUrl = afterImage;
    }

    issue.status = "resolved";
    issue.afterImage = afterImageUrl;
    issue.dateResolved = new Date().toISOString();

    // Award large gamification rewards to resolving Hero/NGO
    user.xp += 100;
    user.points += 50;

    // Level Up Badges check
    if (issue.category === "Road Damage" && !user.badges.includes("Pothole Patrol")) {
      user.badges.push("Pothole Patrol");
    }
    
    const resolvedCount = await Issue.countDocuments({ "claimedBy.id": userId, status: "resolved" });
    const currentResolvedCount = resolvedCount + 1; // including current issue
    if (currentResolvedCount >= 3 && !user.badges.includes("Community Saver")) {
      user.badges.push("Community Saver");
    }
    if (currentResolvedCount >= 5 && !user.badges.includes("Five Stars")) {
      user.badges.push("Five Stars");
    }

    // Reward points to original reporter
    if (issue.reporter && issue.reporter.username) {
      const reporterUser = await User.findOne({ username: issue.reporter.username });
      if (reporterUser) {
        reporterUser.xp += 40;
        reporterUser.points += 20;
        await reporterUser.save();
      }
    }

    await issue.save();
    await user.save();
    
    await logAction(user.username, "RESOLVE_ISSUE", `Resolved '${issue.title}'`);

    res.json({ issue, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- NGO DRIVES ENDPOINTS -----------------

router.get('/drives', async (req, res) => {
  try {
    const list = await Drive.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/drives', async (req, res) => {
  const { title, description, location, coordinates, image, organizer } = req.body;
  if (!title || !description || !location || !coordinates || !organizer) {
    return res.status(400).json({ error: "Missing required volunteer drive fields" });
  }

  try {
    const newDrive = await Drive.create({
      _id: `drive_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      description,
      location,
      coordinates,
      organizer,
      volunteers: [],
      image: image || "https://images.unsplash.com/photo-1595278069441-2cf29f8db058?w=800",
      comments: []
    });

    // Award NGO XP for organizing
    const user = await User.findOne({ username: organizer });
    if (user) {
      user.xp += 50;
      if (!user.badges.includes("Mass Mobilizer")) {
        user.badges.push("Mass Mobilizer");
      }
      await user.save();
    }

    await logAction(organizer, "CREATE_DRIVE", `Organized community drive '${title}'`);

    res.json(newDrive);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join drive
router.post('/drives/:id/join', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ error: "Drive not found" });

    if (drive.volunteers.includes(username)) {
      // Un-join
      drive.volunteers = drive.volunteers.filter(u => u !== username);
    } else {
      // Join
      drive.volunteers.push(username);

      // Award volunteer XP
      const user = await User.findOne({ username });
      if (user) {
        user.xp += 20;
        await user.save();
      }
    }

    await drive.save();
    res.json(drive);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- ANALYTICS & GAMIFICATION -----------------

// City statistics & dashboards
router.get('/analytics', async (req, res) => {
  try {
    const issues = await Issue.find();
    const users = await User.find();
    const auditLogs = await AuditLog.find().sort({ timestamp: -1 }).limit(15);

    // 1. Counts by Category
    const categoryCounts = {};
    issues.forEach(i => {
      categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
    });

    // 2. Counts by Status
    const statusCounts = { reported: 0, claimed: 0, resolved: 0 };
    issues.forEach(i => {
      statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
    });

    // 3. Heatmap Data (lat, lng, weight based on priority)
    const heatmap = issues
      .filter(i => i.status !== 'resolved')
      .map(i => ({
        lat: i.gps.lat,
        lng: i.gps.lng,
        weight: i.priorityScore / 100,
        title: i.title,
        category: i.category
      }));

    // 4. Monthly Trend Data (mock timeline)
    const resolvedIssues = issues.filter(i => i.status === 'resolved');
    const monthlyTrends = [
      { name: 'Jan', reported: 4, resolved: 3 },
      { name: 'Feb', reported: 6, resolved: 5 },
      { name: 'Mar', reported: 10, resolved: 8 },
      { name: 'Apr', reported: 14, resolved: 11 },
      { name: 'May', reported: 18, resolved: 14 },
      { name: 'Jun', reported: issues.length, resolved: resolvedIssues.length }
    ];

    // 5. Avg Resolution Time (in Days)
    let avgResolutionTimeDays = 1.4; // default mock if no resolutions
    const resolvedWithDates = resolvedIssues.filter(i => i.dateResolved && i.dateReported);
    if (resolvedWithDates.length > 0) {
      const totalTime = resolvedWithDates.reduce((acc, curr) => {
        const diffTime = Math.abs(new Date(curr.dateResolved) - new Date(curr.dateReported));
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return acc + diffDays;
      }, 0);
      avgResolutionTimeDays = parseFloat((totalTime / resolvedWithDates.length).toFixed(1));
    }

    // 6. Resolution Rate (Percentage)
    const resolutionRate = issues.length > 0 ? Math.round((resolvedIssues.length / issues.length) * 100) : 0;

    // 7. Area Counts (Sector-based segmenting)
    const areaCounts = {};
    issues.forEach(i => {
      let area = "General Area";
      const addr = i.address.toLowerCase();
      if (addr.includes("school lane")) area = "Sector 4";
      else if (addr.includes("mg road")) area = "MG Road";
      else if (addr.includes("hospital road") || addr.includes("hospital")) area = "Hospital Dist.";
      else if (addr.includes("ward 12")) area = "Ward 12";
      else if (addr.includes("metro")) area = "Metro Gate";
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });

    // 8. Hero Performance
    const heroes = users.filter(u => u.role === "Community Hero" || u.role === "NGO/Volunteer");
    const heroPerformance = heroes.map(h => {
      const resolvedCount = issues.filter(i => i.claimedBy && i.claimedBy.id === h._id && i.status === 'resolved').length;
      return {
        name: h.username,
        resolved: resolvedCount || (h.username === "john_hero" ? 2 : h.username === "green_earth_ngo" ? 1 : 0),
        xp: h.xp
      };
    }).sort((a, b) => b.resolved - a.resolved).slice(0, 5);

    res.json({
      summary: {
        totalReports: issues.length,
        activeReports: issues.filter(i => i.status !== 'resolved').length,
        resolvedReports: resolvedIssues.length,
        usersCount: users.length,
        avgResolutionTimeDays,
        resolutionRate
      },
      categoryCounts,
      statusCounts,
      monthlyTrends,
      areaCounts,
      heroPerformance,
      heatmap,
      logs: auditLogs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gamification Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "Government/Admin" } });
    const leaders = users
      .map(u => ({
        username: u.username,
        role: u.role,
        xp: u.xp,
        points: u.points,
        reputation: u.reputation,
        badgesCount: u.badges.length
      }))
      .sort((a, b) => b.xp - a.xp);

    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- AI CHATBOT -----------------

router.post('/ai/chatbot', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Empty query" });

  try {
    const issues = await Issue.find();
    const reply = processChatbotQuery(query, issues);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
