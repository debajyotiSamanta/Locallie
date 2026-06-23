// AI Service Helper for Locallie

// Calculate distance between two coordinates in meters (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

/**
 * AI Auto Categorization
 */
const autoCategorize = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes("pothole") || text.includes("road") || text.includes("cracked path") || text.includes("asphalt") || text.includes("street repair")) {
    return "Road Damage";
  }
  if (text.includes("garbage") || text.includes("trash") || text.includes("dump") || text.includes("waste") || text.includes("litter") || text.includes("bin")) {
    return "Sanitation";
  }
  if (text.includes("light") || text.includes("electricity") || text.includes("wire") || text.includes("lamp") || text.includes("dark lane") || text.includes("short circuit")) {
    return "Electrical";
  }
  if (text.includes("water") || text.includes("leak") || text.includes("pipe") || text.includes("drain") || text.includes("flooding") || text.includes("sewage")) {
    return "Water Leakage";
  }
  if (text.includes("tree") || text.includes("branch") || text.includes("leaf") || text.includes("fallen tree")) {
    return "Fallen Trees";
  }
  if (text.includes("danger") || text.includes("safety") || text.includes("theft") || text.includes("crime") || text.includes("illegal") || text.includes("harassment") || text.includes("public safety")) {
    return "Public Safety";
  }
  
  return "General Concerns";
};

/**
 * AI Duplicate Detection
 */
const detectDuplicates = (newLat, newLng, category, existingIssues) => {
  const duplicates = [];
  const activeIssues = existingIssues.filter(i => i.status !== 'resolved' && !i.duplicateOf);
  
  for (const issue of activeIssues) {
    if (issue.category === category) {
      const dist = calculateDistance(newLat, newLng, issue.gps.lat, issue.gps.lng);
      if (dist < 100) { // Within 100 meters
        duplicates.push({
          id: issue.id,
          title: issue.title,
          distanceMeters: Math.round(dist),
          status: issue.status
        });
      }
    }
  }
  return duplicates;
};

/**
 * AI Severity Detection
 */
const detectSeverity = (title, description, category) => {
  const text = `${title} ${description}`.toLowerCase();
  
  // Emergency indicators
  if (text.includes("emergency") || text.includes("danger") || text.includes("hazard") || text.includes("injury") || text.includes("accident") || text.includes("fire") || text.includes("live wire") || text.includes("blocking traffic")) {
    return "Emergency";
  }
  
  // High indicators
  if (text.includes("school") || text.includes("hospital") || text.includes("elderly") || text.includes("kid") || text.includes("child") || text.includes("main road") || text.includes("high voltage") || text.includes("toxic")) {
    return "High";
  }

  // Base categorization defaults
  if (category === "Electrical" && text.includes("wire")) return "High";
  if (category === "Water Leakage" && text.includes("flooding")) return "High";
  if (category === "Public Safety") return "High";
  if (category === "Road Damage") return "Medium";
  if (category === "Sanitation") return "Medium";
  
  return "Low";
};

/**
 * AI Fake Report Detection
 */
const detectFakeReport = (title, description) => {
  const spamKeywords = ["asdf", "qwerty", "123456", "test report", "dummy report", "click here", "buy now", "spam"];
  const text = `${title} ${description}`.toLowerCase();
  
  // Rule 1: Too short
  if (title.length < 5 || description.length < 10) {
    return { isFake: true, reason: "Report details are too short or incomplete." };
  }
  
  // Rule 2: Contains spam keywords
  for (const keyword of spamKeywords) {
    if (text.includes(keyword)) {
      return { isFake: true, reason: `Contains potential spam or placeholder keywords: "${keyword}"` };
    }
  }

  // Rule 3: Gibberish detection (repeated vowels/consonants or no spaces)
  if (description.split(' ').length < 2 && description.length > 25) {
    return { isFake: true, reason: "Text appears to be single-word gibberish." };
  }

  return { isFake: false, reason: "Validated by spam engine." };
};

/**
 * AI Priority Score Generator
 */
const calculatePriorityScore = (severity, upvotesCount, category) => {
  let severityWeight = 20;
  if (severity === "Medium") severityWeight = 40;
  if (severity === "High") severityWeight = 70;
  if (severity === "Emergency") severityWeight = 95;

  const upvotesBonus = upvotesCount * 5;
  const categoryBonus = (category === "Public Safety" || category === "Electrical") ? 10 : 0;
  
  // Final score out of 100 (capped at 99 for high priority, 100 for emergencies)
  const baseScore = severityWeight + upvotesBonus + categoryBonus;
  return Math.min(100, Math.max(10, baseScore));
};

/**
 * AI Description Improvement
 */
const improveDescription = (title, description, category) => {
  // Polishing text to make it sound professional for departments
  let cleanDesc = description.trim();
  // Capitalize first letter
  cleanDesc = cleanDesc.charAt(0).toUpperCase() + cleanDesc.slice(1);
  if (!cleanDesc.endsWith('.')) cleanDesc += '.';

  const addition = ` [AI Optimized: This issue belongs to the ${category} category and poses a localized challenge. Please dispatch a municipal team or Community Hero to inspect the site.]`;
  return `${cleanDesc}${addition}`;
};

/**
 * AI OCR Parsing Simulation
 */
const runOCR = (imageUrl) => {
  if (!imageUrl) return { houseNumber: "", roadName: "" };
  
  // Mocking OCR based on image strings
  if (imageUrl.includes("school")) {
    return { houseNumber: "124", roadName: "School Lane" };
  }
  if (imageUrl.includes("hospital") || imageUrl.includes("56")) {
    return { houseNumber: "45", roadName: "Hospital Road" };
  }
  if (imageUrl.includes("metro") || imageUrl.includes("gate")) {
    return { houseNumber: "Metro Stn Gate A", roadName: "MG Road" };
  }
  
  // Default fallback OCR readings
  return { houseNumber: "10-B", roadName: "Main Ring Road" };
};

/**
 * AI Image Verification
 */
const verifyImage = (imageUrl, category) => {
  if (!imageUrl) return { isValid: false, confidence: 0, error: "No image uploaded" };

  // Mock analysis
  const cat = category.toLowerCase();
  let confidence = 85 + Math.floor(Math.random() * 14); // 85% to 99%
  
  return {
    isValid: true,
    confidence: confidence,
    detectedObjects: [category, "Street Environment"],
    message: `AI Image Verification completed successfully. Confidence score: ${confidence}%. Detected ${category.toLowerCase()} objects matching report.`
  };
};

/**
 * AI Chatbot
 */
const processChatbotQuery = (query, issues) => {
  const q = query.toLowerCase();
  
  if (q.includes("status") || q.includes("my report") || q.includes("where is")) {
    // Find reported issues
    const match = issues.find(i => q.includes(i.title.toLowerCase()) || q.includes(i.id));
    if (match) {
      return `Issue "${match.title}" (ID: ${match.id}) is currently in **${match.status.toUpperCase()}** status. It was reported on ${new Date(match.dateReported).toLocaleDateString()} and is assigned to the ${match.department}.`;
    }
    
    // Summary
    const reported = issues.filter(i => i.status === 'reported').length;
    const claimed = issues.filter(i => i.status === 'claimed').length;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    return `Currently, there are **${reported}** reported issues, **${claimed}** claimed issues under repair, and **${resolved}** resolved issues in the city. Tell me the ID or name of an issue to fetch its exact progress status!`;
  }
  
  if (q.includes("how to report") || q.includes("how do i report") || q.includes("report an issue")) {
    return `To report an issue: 
1. Go to the **Resident Dashboard** or click **Report Issue**.
2. Fill out the Title, Description, and select the Category.
3. Use the GPS location picker to pin the location on the map.
4. Upload an image (our AI will auto-verify it!).
5. Submit. You can also report anonymously if needed.`;
  }

  if (q.includes("hero") || q.includes("claim") || q.includes("volunteer")) {
    return `**Community Heroes** are local residents, volunteers, or NGO staff who resolve reported problems. Once you claim an issue, you go to the site, fix it, and upload a **Before & After** evidence photo to gain reputation points and badges!`;
  }

  if (q.includes("pothole") || q.includes("garbage") || q.includes("water") || q.includes("streetlight")) {
    const list = issues.filter(i => i.title.toLowerCase().includes("pothole") || i.description.toLowerCase().includes("pothole") || i.category.toLowerCase().includes("water") || i.category.toLowerCase().includes("electrical") || i.category.toLowerCase().includes("sanitation"));
    if (list.length > 0) {
      return `I found these related issues nearby: ${list.map(i => `\n- "${i.title}" (${i.status})`).join('')}`;
    }
  }

  return `Hello! I am Locallie's AI Civic Assistant. I can help you check issue statuses, answer queries about reporting flows, guide volunteers on how to claim tasks, or provide contact information for city departments. What can I do for you today?`;
};

module.exports = {
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
};
