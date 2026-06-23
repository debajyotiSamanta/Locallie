const mongoose = require('mongoose');
const { User, Issue, Drive, AuditLog } = require('./models');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Default initial database content for fallback seeding
const initialDB = {
  users: [
    {
      id: "u_resident_jane",
      username: "jane_doe",
      email: "jane@example.com",
      password: "password123",
      role: "Resident",
      xp: 280,
      points: 120,
      badges: ["First Report", "Active Voice"],
      reputation: "Trusted Reporter"
    },
    {
      id: "u_hero_john",
      username: "john_hero",
      email: "john@example.com",
      password: "password123",
      role: "Community Hero",
      xp: 850,
      points: 450,
      badges: ["Pothole Patrol", "Community Saver", "Five Stars"],
      reputation: "Local Legend"
    },
    {
      id: "u_ngo_green",
      username: "green_earth_ngo",
      email: "ngo@example.com",
      password: "password123",
      role: "NGO/Volunteer",
      xp: 620,
      points: 300,
      badges: ["Green Creator", "Mass Mobilizer"],
      reputation: "NGO Coordinator"
    },
    {
      id: "u_admin_chief",
      username: "admin_chief",
      email: "admin@example.com",
      password: "password123",
      role: "Government/Admin",
      xp: 0,
      points: 0,
      badges: [],
      reputation: "Super Administrator"
    }
  ],
  issues: [
    {
      id: "issue_1",
      title: "Massive Pothole on School Lane",
      description: "A huge pothole has formed right in front of Oakridge High School. It is dangerous for school buses and cyclists are swerving to avoid it. Needs urgent repairs.",
      category: "Road Damage",
      address: "124 School Lane, Sector 4, Metro City",
      gps: { lat: 12.9716, lng: 77.5946 },
      image: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800",
      video: "",
      priority: "High",
      severity: "High",
      status: "reported",
      reporter: { username: "jane_doe", email: "jane@example.com" },
      comments: [
        {
          id: "c_1",
          username: "john_hero",
          text: "I saw this yesterday. Planning to get some gravel and asphalt patch to fill this up if the municipal team doesn't claim it by tomorrow.",
          date: "2026-06-22T10:30:00Z"
        }
      ],
      upvotes: ["u_resident_jane", "u_ngo_green"],
      claimedBy: null,
      dateReported: "2026-06-22T08:15:00Z",
      dateClaimed: null,
      dateResolved: null,
      beforeImage: "",
      afterImage: "",
      isAnonymous: false,
      department: "Public Works Department",
      duplicateOf: null,
      priorityScore: 88
    },
    {
      id: "issue_2",
      title: "Illegal Garbage Dumping near Metro Gate A",
      description: "People are continuously dumping bags of household garbage right next to the metro station entrance. The smell is unbearable and it's attracting stray dogs.",
      category: "Sanitation",
      address: "Metro Station Gate A, MG Road",
      gps: { lat: 12.9756, lng: 77.5976 },
      image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800",
      video: "",
      priority: "Medium",
      severity: "Medium",
      status: "claimed",
      reporter: { username: "jane_doe", email: "jane@example.com" },
      comments: [
        {
          id: "c_2",
          username: "green_earth_ngo",
          text: "We have claimed this issue! Organizing a volunteer drive this Saturday morning to clean it up and put flower pots to prevent future dumping.",
          date: "2026-06-23T05:40:00Z"
        }
      ],
      upvotes: ["u_resident_jane", "u_hero_john", "u_ngo_green"],
      claimedBy: { id: "u_ngo_green", username: "green_earth_ngo", role: "NGO/Volunteer" },
      dateReported: "2026-06-22T14:20:00Z",
      dateClaimed: "2026-06-23T05:30:00Z",
      dateResolved: null,
      beforeImage: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800",
      afterImage: "",
      isAnonymous: false,
      department: "Sanitation & Waste Management",
      duplicateOf: null,
      priorityScore: 72
    },
    {
      id: "issue_3",
      title: "Broken Streetlight on Hospital Street",
      description: "The main streetlight near City General Hospital is completely dead. The lane is pitch dark at night, making it unsafe for nurses and patients walking back.",
      category: "Electrical",
      address: "45 Hospital Road, Ward 12",
      gps: { lat: 12.9696, lng: 77.5916 },
      image: "https://images.unsplash.com/photo-1509023467866-9099f4401b56?w=800",
      video: "",
      priority: "High",
      severity: "High",
      status: "resolved",
      reporter: { username: "anonymous_resident", email: "anon@localfix.org" },
      comments: [
        {
          id: "c_3",
          username: "john_hero",
          text: "Replaced the bulb and re-secured the loose wiring. Streetlight is now fully operational!",
          date: "2026-06-23T09:12:00Z"
        }
      ],
      upvotes: ["u_resident_jane"],
      claimedBy: { id: "u_hero_john", username: "john_hero", role: "Community Hero" },
      dateReported: "2026-06-22T19:00:00Z",
      dateClaimed: "2026-06-23T07:00:00Z",
      dateResolved: "2026-06-23T09:12:00Z",
      beforeImage: "https://images.unsplash.com/photo-1509023467866-9099f4401b56?w=800",
      afterImage: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800",
      isAnonymous: true,
      department: "Electrical Department",
      duplicateOf: null,
      priorityScore: 94
    }
  ],
  drives: [
    {
      id: "drive_1",
      title: "Metro Cleanliness & Beautification Drive",
      description: "Join us in cleaning up the garbage dumps near Metro Station Gate A. We will clean the site, spray eco-friendly disinfectants, and install hand-painted plant barrels.",
      organizer: "green_earth_ngo",
      date: "2026-06-27T08:00:00Z",
      location: "Metro Station Gate A, MG Road",
      coordinates: { lat: 12.9756, lng: 77.5976 },
      volunteers: ["jane_doe", "john_hero"],
      image: "https://images.unsplash.com/photo-1595278069441-2cf29f8db058?w=800",
      comments: []
    }
  ],
  auditLogs: [
    {
      id: "log_1",
      timestamp: "2026-06-22T08:15:00Z",
      user: "jane_doe",
      action: "REPORT_ISSUE",
      details: "Reported 'Massive Pothole on School Lane'"
    },
    {
      id: "log_2",
      timestamp: "2026-06-23T05:30:00Z",
      user: "green_earth_ngo",
      action: "CLAIM_ISSUE",
      details: "Claimed 'Illegal Garbage Dumping near Metro Gate A'"
    },
    {
      id: "log_3",
      timestamp: "2026-06-23T09:12:00Z",
      user: "john_hero",
      action: "RESOLVE_ISSUE",
      details: "Resolved 'Broken Streetlight on Hospital Street'"
    }
  ]
};

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in the environment config (.env)");
    }
    const conn = await mongoose.connect(mongoURI);
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.db.databaseName}`);
    await seedDatabase();
  } catch (err) {
    console.error(`[MongoDB] Connection error:`, err.message);
    process.exit(1);
  }
};

// Seed MongoDB collections from db.json or hardcoded fallback
const seedDatabase = async () => {
  try {
    const usersCount = await User.countDocuments();
    if (usersCount > 0) {
      console.log(`[Seeder] MongoDB already seeded. Skipping initial seed.`);
      return;
    }

    console.log(`[Seeder] Empty database detected. Initiating migration/seed...`);
    let seedData = null;

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        seedData = JSON.parse(raw);
        console.log(`[Seeder] Loaded seed payload from db.json`);
      } catch (err) {
        console.error(`[Seeder] Failed reading db.json, using fallback structure:`, err);
      }
    }

    if (!seedData) {
      seedData = initialDB;
      console.log(`[Seeder] Using default initialDB for seeding`);
    }

    // 1. Seed Users
    if (seedData.users && seedData.users.length > 0) {
      const usersToInsert = seedData.users.map(u => ({
        _id: u.id,
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
        xp: u.xp || 0,
        points: u.points || 0,
        badges: u.badges || [],
        reputation: u.reputation
      }));
      await User.insertMany(usersToInsert);
      console.log(`[Seeder] Seeded ${usersToInsert.length} user accounts.`);
    }

    // 2. Seed Issues
    if (seedData.issues && seedData.issues.length > 0) {
      const issuesToInsert = seedData.issues.map(i => ({
        _id: i.id,
        title: i.title,
        description: i.description,
        category: i.category,
        address: i.address,
        gps: i.gps,
        image: i.image,
        video: i.video || "",
        priority: i.priority || "Low",
        severity: i.severity || "Low",
        status: i.status || "reported",
        reporter: i.reporter,
        comments: i.comments ? i.comments.map(c => ({
          _id: c.id,
          username: c.username,
          text: c.text,
          date: c.date
        })) : [],
        upvotes: i.upvotes || [],
        claimedBy: i.claimedBy || null,
        dateReported: i.dateReported,
        dateClaimed: i.dateClaimed || null,
        dateResolved: i.dateResolved || null,
        beforeImage: i.beforeImage || i.image || "",
        afterImage: i.afterImage || "",
        isAnonymous: !!i.isAnonymous,
        department: i.department,
        duplicateOf: i.duplicateOf || null,
        priorityScore: i.priorityScore || 0
      }));
      await Issue.insertMany(issuesToInsert);
      console.log(`[Seeder] Seeded ${issuesToInsert.length} issue reports.`);
    }

    // 3. Seed drives
    if (seedData.drives && seedData.drives.length > 0) {
      const drivesToInsert = seedData.drives.map(d => ({
        _id: d.id,
        title: d.title,
        description: d.description,
        location: d.location,
        coordinates: d.coordinates,
        organizer: d.organizer,
        volunteers: d.volunteers || [],
        image: d.image,
        comments: d.comments ? d.comments.map(c => ({
          _id: c.id,
          username: c.username,
          text: c.text,
          date: c.date
        })) : []
      }));
      await Drive.insertMany(drivesToInsert);
      console.log(`[Seeder] Seeded ${drivesToInsert.length} clean up drives.`);
    }

    // 4. Seed Audit Logs
    if (seedData.auditLogs && seedData.auditLogs.length > 0) {
      const logsToInsert = seedData.auditLogs.map(l => ({
        _id: l.id,
        timestamp: l.timestamp,
        user: l.user,
        action: l.action,
        details: l.details
      }));
      await AuditLog.insertMany(logsToInsert);
      console.log(`[Seeder] Seeded ${logsToInsert.length} AI moderation audit logs.`);
    }

    console.log(`[Seeder] MongoDB seeding successfully finalized.`);
  } catch (err) {
    console.error(`[Seeder] Seeding error encountered:`, err);
  }
};

module.exports = {
  connectDB
};
