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
  proposition: "A high-intensity 10-hour hackathon for thinkers and creators who turn unstable ideas into working systems.",
  edition: "HACKATHON 2026",
  spirit: "We are not here to participate quietly. We are here to build boldly, challenge expectations, and create an event experience people will remember.",

  // Dates & Countdown
  dates: {
    startDate: "2026-10-10T09:00:00+05:30",
    endDate: "2026-10-10T19:00:00+05:30",
    registrationDeadline: "2026-10-05T23:59:59+05:30",
    pptDeadline: "2026-10-07T23:59:59+05:30",
    displayDateRange: "OCTOBER 10, 2026",
    displayDeadline: "05/10/2026",
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
    registrationFee: 300, // Per person in INR (₹)
    feeType: "₹300 / per person",
    currency: "INR (₹)",
    isRegistrationOpen: true,
  },

  // Payment Details (Manual Verification)
  paymentDetails: {
    upiId: "ecell.vsbcetc@gmail.com",
    payeeName: "E-Cell VSBCETC",
    qrCodeImage: "/assets/qr_code_placeholder.png",
    instructions: [
      "Pay ₹300 per person for your team size (e.g. 2 members = ₹600, 3 members = ₹900, 4 members = ₹1200) via any UPI app.",
      "Take a clear screenshot of the completed payment receipt showing the 12-digit UTR/Reference number.",
      "Upload your payment screenshot and 12-digit UTR number directly in the Team Registration form.",
      "Upload your project presentation pitch deck (.ppt, .pptx, or .pdf) during registration."
    ]
  },

  // PPT Submission Limits
  pptPolicy: {
    maxFileSizeBytes: 15 * 1024 * 1024, // 15 MB
    allowedExtensions: [".ppt", ".pptx", ".pdf"],
    templateDownloadUrl: "#",
  },

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
      title: "REGISTRATIONS & PPT SUBMISSION OPEN",
      date: "SEPTEMBER 20, 2026",
      time: "09:00 AM IST",
      status: "ACTIVE",
      details: "Team registration opens. Form your squad of 2–4 members and select your hackathon track. Initial registration is free."
    },
    {
      phase: "02",
      title: "REGISTRATION & PPT DEADLINE",
      date: "OCTOBER 05, 2026",
      time: "11:59 PM IST",
      status: "UPCOMING",
      details: "Final date for team registration and pitch deck PPT submission via the Submit PPT portal."
    },
    {
      phase: "03",
      title: "FIRST-COME, FIRST-SERVED PAYMENT & SLOT CONFIRMATION (ONLY 40 TEAMS)",
      date: "OCTOBER 07, 2026",
      time: "06:00 PM IST",
      status: "UPCOMING",
      details: "Payment portal active. Strictly capped at only 40 teams. Registered squads confirm their participation slots strictly on a First-Come, First-Served (FCFS) basis by submitting the ₹300/person fee before capacity is full."
    },
    {
      phase: "04",
      title: "THE 10-HOUR HACKATHON SPRINT",
      date: "OCTOBER 10, 2026",
      time: "09:00 AM IST",
      status: "UPCOMING",
      details: "10-hour continuous build sprint begins at Auditorium, VSBCETC for the 40 confirmed teams. Live check-ins and mentor guidance."
    },
    {
      phase: "05",
      title: "JURY DEMO & EVALUATION",
      date: "OCTOBER 10, 2026",
      time: "05:00 PM IST",
      status: "UPCOMING",
      details: "Project code freeze and live team presentations to jury panel."
    }
  ],

  // Rules & Guidelines
  rules: [
    {
      category: "TEAM ELIGIBILITY",
      items: [
        "Event capacity is strictly limited to 40 teams only. Once 40 slots are locked, entries close immediately.",
        "Teams must consist of 2 to 4 members. Cross-college and cross-department squads are welcome.",
        "All team members must be enrolled Undergraduate (UG) students (1st to 4th Year) carrying valid institutional IDs.",
        "A student can only participate in one registered team."
      ]
    },
    {
      category: "FEE & PAYMENT POLICY",
      items: [
        "Registration fee is ₹300 per person (e.g., 2 members = ₹600, 3 members = ₹900, 4 members = ₹1,200).",
        "Event slots are strictly limited to only 40 teams, allocated on a First-Come, First-Served (FCFS) basis with no shortlisting phase. Teams must complete payment via the Payment Portal to lock their confirmed slot.",
        "Entering your Team Registration ID in the Payment Portal automatically fetches your squad size and calculates your total fee.",
        "A clear payment receipt screenshot showing the 12-digit UTR/Reference number must be uploaded for verification.",
        "Registration fees are non-refundable once payment verification is confirmed by the organizers."
      ]
    },
    {
      category: "PPT SUBMISSION GUIDELINES",
      items: [
        "A presentation pitch deck (.ppt, .pptx, or .pdf) can be uploaded and updated anytime via the Submit PPT page.",
        "Maximum file size permitted is 15 MB.",
        "The deck should clearly outline the problem statement, proposed technical solution, architecture, and tech stack."
      ]
    },
    {
      category: "ORIGINALITY & CODE OF CONDUCT",
      items: [
        "All projects must be built during the hackathon timeline. Open-source libraries and APIs are allowed.",
        "Plagiarism, pre-built complete applications, or misleading submissions result in immediate disqualification.",
        "Maintain professional, respectful conduct with mentors, organizers, and peers throughout the event."
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
      answer: "Gambit's Glitch is a high-intensity 10-hour hackathon taking place at Auditorium, VSBCETC on October 10, 2026. Any college student can register a team of 2 to 4 members. Event capacity is strictly limited to only 40 teams."
    },
    {
      id: "faq-2",
      question: "What is the registration fee and how is it calculated?",
      answer: "The registration fee is ₹300 per person. When you enter your Team Registration ID in the Payment Portal, the system auto-calculates your exact team fee based on your member count (e.g., ₹600 for 2 members, ₹900 for 3 members, ₹1,200 for 4 members)."
    },
    {
      id: "faq-3",
      question: "How and when do I pay the registration fee and submit our PPT?",
      answer: "Slots are allocated strictly on a First-Come, First-Served (FCFS) basis with a strict cap of ONLY 40 TEAMS. You submit your project PPT pitch deck during registration. Then, enter your Team ID on the Payment Portal, pay via UPI (₹300 per member), and submit your 12-digit UTR reference number to lock your team's confirmed entry before all 40 spots fill up."
    },
    {
      id: "faq-4",
      question: "Why does the Payment Portal show 'PAYMENT SUBMISSION NOT YET OPEN' or locked status?",
      answer: "The Payment Portal is controlled by organizers. If locked, administrators have temporarily paused new payment submissions or the maximum event capacity of 40 confirmed teams has been reached. When unlocked, any registered team can process payment on a First-Come, First-Served (FCFS) basis."
    },
    {
      id: "faq-5",
      question: "What are the 5 hackathon tracks?",
      answer: "The 5 tracks are: Health care, Agriculture, Fintech, Cybersecurity, and Education. Teams select their preferred track during initial registration."
    },
    {
      id: "faq-6",
      question: "How do we receive our official Event Day Attendance Pass?",
      answer: "Once your payment screenshot and 12-digit UTR reference number are verified by organizers in the Admin Control Panel, your official QR Attendance Pass & Invoice are automatically issued and linked to your Team Registration ID."
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

