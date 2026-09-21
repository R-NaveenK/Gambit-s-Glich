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
      details: "Team registration opens. Form your squad of 2–4 members, upload your payment screenshot & PPT presentation, and select your track."
    },
    {
      phase: "02",
      title: "REGISTRATION & PPT DEADLINE",
      date: "OCTOBER 05, 2026",
      time: "11:59 PM IST",
      status: "UPCOMING",
      details: "Final date for team registration, payment screenshot verification, and pitch deck PPT submission."
    },
    {
      phase: "03",
      title: "SHORTLIST ANNOUNCEMENT",
      date: "OCTOBER 07, 2026",
      time: "06:00 PM IST",
      status: "UPCOMING",
      details: "Selected finalist teams announced for the physical 10-hour hackathon at Auditorium, VSBCETC."
    },
    {
      phase: "04",
      title: "THE 10-HOUR HACKATHON SPRINT",
      date: "OCTOBER 10, 2026",
      time: "09:00 AM IST",
      status: "UPCOMING",
      details: "10-hour continuous build sprint begins at Auditorium, VSBCETC. Live check-ins and mentor guidance."
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
        "Teams must consist of 2 to 4 members. Cross-college and cross-department squads are welcome.",
        "All team members must be enrolled Undergraduate (UG) students (1st to 4th Year) carrying valid institutional IDs.",
        "A student can only participate in one registered team."
      ]
    },
    {
      category: "FEE & PAYMENT POLICY",
      items: [
        "Registration fee is ₹300 per person (e.g., 2 members = ₹600, 3 members = ₹900, 4 members = ₹1200).",
        "A clear screenshot of the payment receipt showing the 12-digit UTR/Reference number must be submitted during registration.",
        "Registration fees are non-refundable once payment verification is confirmed by the organizers."
      ]
    },
    {
      category: "PPT SUBMISSION GUIDELINES",
      items: [
        "A presentation pitch deck (.ppt, .pptx, or .pdf) must be submitted during registration.",
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
      answer: "Gambit's Glitch is a high-intensity 10-hour hackathon taking place at Auditorium, VSBCETC on October 10, 2026. Any college student can register a team of 2 to 4 members."
    },
    {
      id: "faq-2",
      question: "What is the registration fee and deadline?",
      answer: "The registration fee is ₹300 per person (e.g. ₹900 for a 3-member team). The deadline for registration, payment screenshot, and PPT submission is 05/10/2026."
    },
    {
      id: "faq-3",
      question: "How do I submit the payment screenshot and PPT?",
      answer: "Both the payment screenshot (with 12-digit UTR number) and your PPT pitch deck (.ppt, .pptx, .pdf) can be uploaded directly within the Team Registration form on this website."
    },
    {
      id: "faq-4",
      question: "What are the 5 hackathon tracks?",
      answer: "The 5 tracks are: Health care, Agriculture, Fintech, Cybersecurity, and Education. Teams select their preferred track during registration."
    },
    {
      id: "faq-5",
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

