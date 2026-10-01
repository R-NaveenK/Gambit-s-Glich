/**
 * GAMBIT'S GLITCH 2026 - Central Event Configuration
 * 
 * All editable event details are maintained here.
 * Organizers can customize dates, rules, prizes, themes, FAQ items, and contact data.
 * Items requiring actual organizer inputs are tagged with `TODO_EVENT_DATA`.
 */

export const eventConfig = {
  // Core Branding
  eventName: "GAMBIT’S GLITCH",
  tagline: "BREAK THE SYSTEM. BUILD THE FUTURE.",
  proposition: "A high-intensity 8-hour hackathon (09:00 AM – 06:45 PM) for thinkers and creators who turn unstable ideas into working systems.",
  edition: "HACKATHON 2026",
  spirit: "We are not here to participate quietly. We are here to build boldly, challenge expectations, and create an event experience people will remember.",

  // Dates & Countdown
  dates: {
    startDate: "2026-10-13T09:00:00+05:30",
    endDate: "2026-10-13T18:45:00+05:30",
    registrationDeadline: "2026-10-10T23:59:59+05:30",
    displayDateRange: "OCTOBER 13, 2026",
    displayDeadline: "10/10/2026",
    timings: "09:00 AM – 06:45 PM",
    duration: "8-HOUR BUILD"
  },

  duration: {
    hours: 8,
    timings: "09:00 AM – 06:45 PM",
    format: "8-HOUR BUILD"
  },

  // Venue & Location
  venue: {
    type: "ON-SITE",
    name: "AUDITORIUM",
    city: "VSBCETC",
    address: "Auditorium, VSBCETC",
    location: "Auditorium, VSBCETC",
    mapLink: "https://maps.google.com",
  },

  // Team & Registration Policy
  teamPolicy: {
    minMembers: 2,
    maxMembers: 4,
    maxTeams: 40, // Strict event capacity: only 40 teams permitted
    registrationFee: 250, // Per person in INR (₹)
    feeType: "₹250 / per person",
    currency: "INR (₹)",
    isRegistrationOpen: true,
  },

  // Payment Details (Directly in Registration)
  paymentDetails: {
    upiId: "ecell.vsbcetc@gmail.com",
    payeeName: "E-Cell VSBCETC",
    qrCodeImage: "/assets/qr_code_placeholder.png",
    instructions: [
      "Registration fee is ₹250 per member (2 members = ₹500, 3 members = ₹750, 4 members = ₹1,000).",
      "Pay via any UPI app (GPay, PhonePe, Paytm) to ecell.vsbcetc@gmail.com.",
      "Submit your 12-digit UTR reference number and upload the screenshot proof directly in the registration form below.",
      "Slots are confirmed strictly on a First-Come, First-Served basis for only 40 teams."
    ]
  },

  // On-Spot Problem Statement Policy (No PPT Submission)
  problemStatementPolicy: {
    format: "ON-SPOT PROBLEM STATEMENT RELEASE",
    announcementTime: "09:30 AM IST, OCTOBER 13, 2026",
    venue: "Auditorium, VSBCETC",
    duration: "8-HOUR BUILD (09:30 AM – 05:30 PM)",
    details: "All specific challenge problem statements are announced strictly ON SPOT during the 09:30 AM kickoff. No prior PPT or project presentation is required."
  },

  // Detailed Event Day Schedule (09:00 AM to 06:45 PM)
  eventDaySchedule: [
    { time: "09:00 AM", title: "INAUGURATION CEREMONY", desc: "Official opening ceremony, welcome address, and arena orientation at Auditorium, VSBCETC." },
    { time: "09:10 AM", title: "CHIEF GUEST SPEECH", desc: "Keynote address and industry insights by the distinguished chief guest." },
    { time: "09:30 AM", title: "HACKATHON KICK OFF", desc: "Problem statements revealed live on spot. The 8-hour sprint begins!" },
    { time: "11:30 AM", title: "REFRESHMENT 1 & EVALUATION 1", desc: "Morning tea & refreshments served. First round jury evaluation commences at team stations." },
    { time: "12:30 PM", title: "LUNCH BREAK", desc: "Grand buffet lunch served for all registered participants and mentors." },
    { time: "01:15 PM", title: "LUNCH BREAK ENDS", desc: "Sprint resumes. Teams continue core development, architectural hardening, and feature integration." },
    { time: "03:20 PM", title: "REFRESHMENT 2", desc: "Afternoon refreshments served to keep builder momentum high." },
    { time: "05:30 PM", title: "HACKATHON SPRINT ENDS", desc: "Strict code freeze! Final Git commits, build packaging, and environment freeze." },
    { time: "05:30 PM", title: "FINAL EVALUATION STARTS", desc: "Comprehensive technical demonstration, prototype walkthrough, and defense before the jury panel." },
    { time: "06:30 PM", title: "FINAL EVALUATION ENDS", desc: "Jury completes evaluation. Scores are tabulated and winners are finalized." },
    { time: "06:35 PM", title: "REFRESHMENT 3", desc: "Evening refreshments while jury tabulates official final scores." },
    { time: "06:45 PM", title: "PRIZE DISTRIBUTION", desc: "Valedictory ceremony, announcement of winners, and grand trophy & cash prize distribution." }
  ],

  // Hackathon Themes / Tracks (Exactly 5 Tracks)
  themes: [
    {
      id: "track-01",
      number: "01",
      name: "HEALTH CARE",
      shortDesc: "Innovations in medical technology, patient diagnostic systems, health data security, remote patient monitoring, and telemetry tools."
    },
    {
      id: "track-02",
      number: "02",
      name: "AGRICULTURE",
      shortDesc: "Smart farming solutions, crop health analytics, automated yield prediction, agri-supply chain optimization, and precision soil sensing."
    },
    {
      id: "track-03",
      number: "03",
      name: "FINTECH",
      shortDesc: "Next-generation financial technology, sub-second digital micro-payments, automated fraud detection, algorithmic transaction layers, and secure banking portals."
    },
    {
      id: "track-04",
      number: "04",
      name: "CYBERSECURITY",
      shortDesc: "Proactive threat detection, network security monitoring, zero-trust identity management, vulnerability auditing, and intrusion prevention systems."
    },
    {
      id: "track-05",
      number: "05",
      name: "EDUCATION",
      shortDesc: "EdTech platforms, adaptive personalized learning tools, interactive virtual STEM laboratories, skill verification, and inclusive learning systems."
    }
  ],

  // Event Timeline
  timeline: [
    {
      phase: "01",
      title: "SQUAD REGISTRATION & PAYMENT OPEN (40 TEAMS ONLY)",
      date: "SEPTEMBER 20, 2026",
      time: "09:00 AM IST",
      status: "ACTIVE",
      details: "Team registration opens. Register your squad (2–4 members), pay ₹250/person via UPI, and submit UTR proof directly in the form. Limited strictly to 40 confirmed teams on a First-Come, First-Served basis."
    },
    {
      phase: "02",
      title: "REGISTRATION CLOSING & SLOT FREEZE",
      date: "OCTOBER 10, 2026",
      time: "11:59 PM IST",
      status: "UPCOMING",
      details: "Registration closes on October 10 at 11:59 PM IST or once all 40 confirmed slots are locked."
    },
    {
      phase: "03",
      title: "INAUGURATION & ON-SPOT KICKOFF (09:00 AM – 09:30 AM)",
      date: "OCTOBER 13, 2026",
      time: "09:00 AM IST",
      status: "UPCOMING",
      details: "All 40 confirmed squads assemble at Auditorium, VSBCETC. Inauguration at 09:00 AM, Chief Guest speech at 09:10 AM, and on-spot problem statement release at 09:30 AM."
    },
    {
      phase: "04",
      title: "8-HOUR ARENA SPRINT & EVALUATION 1",
      date: "OCTOBER 13, 2026",
      time: "09:30 AM – 05:30 PM",
      status: "UPCOMING",
      details: "8 hours of live coding with refreshments, lunch at 12:30 PM, and Milestone Evaluation 1 at 11:30 AM."
    },
    {
      phase: "05",
      title: "CODE FREEZE & FINAL EVALUATION (05:30 PM – 06:30 PM)",
      date: "OCTOBER 13, 2026",
      time: "05:30 PM IST",
      status: "UPCOMING",
      details: "Development ends at 05:30 PM sharp. Final jury prototype defense and technical judging until 06:30 PM."
    },
    {
      phase: "06",
      title: "VALEDICTORY & PRIZE DISTRIBUTION",
      date: "OCTOBER 13, 2026",
      time: "06:45 PM IST",
      status: "UPCOMING",
      details: "Refreshment 3 at 06:35 PM followed by the grand valedictory and prize distribution ceremony at 06:45 PM."
    }
  ],

  // Rules & Guidelines
  rules: [
    {
      category: "TEAM ELIGIBILITY",
      items: [
        "Event capacity is strictly limited to 40 teams only. Once 40 slots are locked, registration closes immediately.",
        "Teams must consist of 2 to 4 members. Cross-college and cross-department squads are welcome.",
        "All team members must be enrolled Undergraduate (UG) students (1st to 4th Year) carrying valid institutional IDs.",
        "A student can only participate in one registered team."
      ]
    },
    {
      category: "FEE & PAYMENT POLICY",
      items: [
        "Registration fee is ₹250 per member (2 members = ₹500, 3 members = ₹750, 4 members = ₹1,000).",
        "Payment is submitted directly inside the Registration form. Enter your 12-digit UPI UTR reference number and upload the transaction screenshot in one seamless step.",
        "Slots are allocated strictly on a First-Come, First-Served (FCFS) basis capped at ONLY 40 TEAMS.",
        "Registration fees are non-refundable once payment verification is approved."
      ]
    },
    {
      category: "ON-SPOT PROBLEM STATEMENTS & HACKATHON FORMAT",
      items: [
        "NO advance PPT or pitch deck submission is required. All challenge problem statements are revealed strictly ON SPOT at 09:30 AM on hackathon morning.",
        "All prototypes must be built live during the 8-hour arena sprint (09:30 AM – 05:30 PM). Open-source libraries and APIs are allowed.",
        "Pre-built applications or complete templates built prior to problem release are strictly prohibited and will result in disqualification."
      ]
    },
    {
      category: "ORIGINALITY & CODE OF CONDUCT",
      items: [
        "Maintain professional, respectful conduct with mentors, organizers, and peers throughout the event.",
        "Zero plagiarism policy. Line-by-line code review will be conducted during final evaluation."
      ]
    },
    {
      category: "JUDGING CRITERIA",
      items: [
        "Technical Innovation & Disruption (30%)",
        "Problem Solution & Feasibility (25%)",
        "Execution & Working Prototype (25%)",
        "UI/UX Design & User Experience (10%)",
        "Presentation & Defense (10%)"
      ]
    }
  ],

  // FAQ Items
  faq: [
    {
      id: "faq-1",
      question: "What is Gambit's Glitch and who can participate?",
      answer: "Gambit's Glitch is a high-intensity 8-hour on-site hackathon (09:00 AM – 06:45 PM) taking place at Auditorium, VSBCETC on October 13, 2026. Any college student can register a team of 2 to 4 members. Event capacity is strictly limited to only 40 teams."
    },
    {
      id: "faq-2",
      question: "What is the registration fee and how is it paid?",
      answer: "The registration fee is ₹250 per member (₹500 for 2 members, ₹750 for 3 members, ₹1,000 for 4 members). Registration deadline is October 10, 2026 at 11:59 PM IST. Payment is completed directly within the Team Registration form by paying via UPI and submitting your 12-digit UTR number and payment receipt screenshot."
    },
    {
      id: "faq-3",
      question: "Do we need to submit a PPT pitch deck beforehand?",
      answer: "NO! There is NO PPT or presentation submission prior to the event. All challenge problem statements are revealed strictly ON SPOT during kickoff at 09:30 AM IST on October 13, 2026. All ideation, design, and code development take place live during the 8-hour arena sprint."
    },
    {
      id: "faq-4",
      question: "How are the 40 slots allocated?",
      answer: "Slots are allocated strictly on a First-Come, First-Served (FCFS) basis for exactly 40 teams upon submission and verification of the registration fee. Once 40 slots are locked, registrations close immediately."
    },
    {
      id: "faq-5",
      question: "What happens after registration? When will we know our challenge?",
      answer: "After your payment is verified, you will receive a confirmation email with your Team Registration ID. The actual challenge problem statement will be revealed ON SPOT at 09:30 AM IST on October 13, 2026 at the venue. There is no prior briefing or problem preview."
    },
    {
      id: "faq-6",
      question: "How do we receive our official Event Day Attendance Pass?",
      answer: "Once your payment screenshot and 12-digit UTR reference number are verified by organizers, your official QR Attendance Pass & Invoice are automatically issued and linked to your Team Registration ID in the Status Tracker."
    },
    {
      id: "faq-7",
      question: "Who can I contact for queries?",
      answer: "You can email us at ecell.vsbcetc@gmail.com or call our hotline numbers +91 8438765412 / +91 9791919289."
    }
  ],

  // Contact Information
  contact: {
    email: "ecell.vsbcetc@gmail.com",
    phone: "+91 8438765412 / +91 9791919289",
    location: "Auditorium, VSBCETC",
    socials: {}
  }
};

