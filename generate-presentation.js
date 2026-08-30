const pptxgen = require('pptxgenjs');

const pres = new pptxgen();

pres.author = 'Antigravity AI';
pres.company = 'Loopy Tutorial';
pres.subject = 'Backend Development Masterclass';
pres.title = 'Building Loopy: SaaS Backend';

// Default layout
pres.layout = 'LAYOUT_16x9';

// Slide 1: Title
const slide1 = pres.addSlide();
slide1.background = { color: '3B82F6' }; // Blue
slide1.addText('Building "Loopy"', { x: 1, y: 2, w: '80%', fontSize: 44, bold: true, color: 'FFFFFF', align: 'center' });
slide1.addText('A Full-Stack SaaS Backend Masterclass', { x: 1, y: 3.5, w: '80%', fontSize: 24, color: 'E2E8F0', align: 'center' });
slide1.addText('Complete Student Resources & Guide', { x: 1, y: 4.5, w: '80%', fontSize: 18, color: 'FFFFFF', align: 'center' });

// Slide 2: What is a Backend?
const slide2 = pres.addSlide();
slide2.addText('1. What is a Backend?', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '3B82F6' });
slide2.addText('Imagine a restaurant:', { x: 0.5, y: 1.5, fontSize: 20, bold: true, color: '333333' });
slide2.addText([
    { text: '• Frontend: ', options: { bold: true } }, { text: 'The dining area, menus, and waiters (what the user sees).\n' },
    { text: '• Backend: ', options: { bold: true } }, { text: 'The kitchen. It receives orders (requests), gathers ingredients (data from the database), cooks the meal (business logic), and sends it back to the customer (response).\n\n' },
    { text: 'Today, we are building the kitchen for Loopy.', options: { italic: true, color: '666666' } }
], { x: 0.5, y: 2.2, w: '90%', fontSize: 18, color: '333333' });

// Slide 3: The Server Foundation
const slide3 = pres.addSlide();
slide3.addText('2. The Server Foundation 🏗️', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '3B82F6' });
slide3.addText([
    { text: 'Node.js & Express\n', options: { bold: true, fontSize: 22 } },
    { text: 'To build a kitchen, you need a building. For us, that building is Node.js (which lets us run JavaScript on a computer) and Express (a framework that makes building web servers easy).\n\n' },
    { text: 'How it works in Loopy:\n', options: { bold: true } },
    { text: 'We created an Express server listening on Port 3000. Think of a port like a specific door on a building. When a user\'s browser wants to talk to Loopy, it knocks on Door 3000.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '333333' });

// Slide 4: RESTful APIs
const slide4 = pres.addSlide();
slide4.addText('3. RESTful APIs & Routing 🗺️', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '3B82F6' });
slide4.addText([
    { text: 'How does the frontend talk to our backend? Using an API.\n', options: { bold: true } },
    { text: 'We use RESTful Routes, which are like specific order windows in our kitchen.\n\n' },
    { text: '• GET /api/campaigns ', options: { bold: true, color: '10B981' } }, { text: '➡️ "Give me all the feedback campaigns."\n' },
    { text: '• POST /api/campaigns ', options: { bold: true, color: '3B82F6' } }, { text: '➡️ "Here is data to create a NEW campaign."\n\n' },
    { text: 'The Request-Response Cycle:\n', options: { bold: true } },
    { text: '1. User fills out form and submits.\n2. Frontend sends an HTTP POST request containing JSON data.\n3. Backend receives it, processes it, and sends back an HTTP 201 Created Response.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, color: '333333' });

// Slide 5: Database
const slide5 = pres.addSlide();
slide5.addText('4. Data Persistence (SQLite) 💾', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '3B82F6' });
slide5.addText([
    { text: 'If our server restarts, memory is wiped clean. We need a vault to store data permanently: A Database.\n\n' },
    { text: 'Relational Schema (The Blueprints):\n', options: { bold: true } },
    { text: 'We created strict tables that relate to each other:\n' },
    { text: '1. Users Table: ', options: { bold: true } }, { text: 'Stores id, email, password_hash, plan_type.\n' },
    { text: '2. Campaigns Table: ', options: { bold: true } }, { text: 'Stores the quest details. It has a user_id Foreign Key that points back to the User!\n' },
    { text: '3. Responses Table: ', options: { bold: true } }, { text: 'Stores the answers. It has a campaign_id Foreign Key.\n\n' },
    { text: 'This ensures data integrity (e.g. a response cannot exist without a campaign).' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, color: '333333' });

// Slide 6: Auth & Sessions
const slide6 = pres.addSlide();
slide6.addText('5. Authentication & Security 🔒', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '3B82F6' });
slide6.addText([
    { text: 'Passwords (Bcrypt)\n', options: { bold: true, fontSize: 20 } },
    { text: 'We never store raw passwords. When a user signs up, we scramble their password into a one-way mathematical hash (e.g., $2b$10$xyz...). When they log in, we hash what they typed and compare!\n\n' },
    { text: 'Sessions (express-session)\n', options: { bold: true, fontSize: 20 } },
    { text: 'HTTP is "stateless" (it forgets who you are immediately). To keep users logged in, we give the user\'s browser a special cookie (a VIP wristband). Every time they request their dashboard, they show the wristband to prove who they are.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, color: '333333' });

// Slide 7: Business Logic
const slide7 = pres.addSlide();
slide7.addText('6. Business Logic & SaaS Tiers 💼', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '3B82F6' });
slide7.addText([
    { text: 'Loopy is a SaaS with a "Free" tier and a "Pro" tier. We enforce these business rules on the backend.\n\n' },
    { text: 'The Logic Check (Middleware):\n', options: { bold: true } },
    { text: 'When a request comes into POST /api/campaigns, before we hit the database, we run a check:\n' },
    { text: '1. Who is making the request? (Check session)\n' },
    { text: '2. What is their plan_type?\n' },
    { text: '3. If they are "Free", count their existing campaigns.\n' },
    { text: '4. If they have 2 campaigns already, return a 403 Forbidden error!\n\n' },
    { text: 'This is the core of SaaS development: protecting resources based on user permissions.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, color: '333333' });

// Slide 8: Webhooks
const slide8 = pres.addSlide();
slide8.addText('7. Webhooks (Server-to-Server) 🕸️', { x: 0.5, y: 0.5, fontSize: 32, bold: true, color: '3B82F6' });
slide8.addText([
    { text: 'Pro users want real-time notifications in Slack. To do this, we built a Webhook integration.\n\n' },
    { text: 'A webhook is simply an API endpoint provided by another application (like Slack).\n\n' },
    { text: 'How Loopy does it:\n', options: { bold: true } },
    { text: '1. The user gives us their Slack Webhook URL.\n' },
    { text: '2. A customer submits a review (POST /api/responses).\n' },
    { text: '3. After saving the review, our backend becomes a client.\n' },
    { text: '4. We use fetch() to send an HTTP POST directly to Slack with the review data!' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, color: '333333' });

// Slide 9: Conclusion
const slide9 = pres.addSlide();
slide9.background = { color: '10B981' }; // Green
slide9.addText('The Full Stack Picture 🎉', { x: 1, y: 1.5, w: '80%', fontSize: 44, bold: true, color: 'FFFFFF', align: 'center' });
slide9.addText('1. Frontend (React) creates the beautiful UI.\n2. Network sends JSON data via HTTP.\n3. Backend (Express) routes requests & enforces logic.\n4. Database (SQLite) safely persists structured data.\n5. Integrations (Webhooks) push data outwards.', { x: 1, y: 3, w: '80%', fontSize: 20, color: 'FFFFFF', align: 'center' });

// Save the Presentation
pres.writeFile({ fileName: 'Loopy_Backend_Masterclass.pptx' }).then(fileName => {
    console.log(`\n✅ Successfully created PowerPoint file: ${fileName}\n`);
});
