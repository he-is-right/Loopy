// Frontend logic for Loopy

async function checkAuth() {
    try {
        const res = await fetch('/me');
        const data = await res.json();
        return data;
    } catch (e) {
        return { loggedIn: false };
    }
}

// --- Dashboard Logic ---
async function initDashboard() {
    const auth = await checkAuth();
    if (!auth.loggedIn) {
        window.location.href = '/login.html';
        return;
    }
    
    document.getElementById('welcomeMsg').innerText = `Welcome, ${auth.firstName || auth.email}`;
    
    loadCampaigns();
    
    const form = document.getElementById('createCampaignForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('campTitle').value;
        const brandColor = document.getElementById('campColor').value;
        const q1 = document.getElementById('q1').value;
        const q2 = document.getElementById('q2').value;
        
        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    brandColor,
                    questions: { q1, q2 }
                })
            });
            
            if (res.ok) {
                form.reset();
                loadCampaigns();
            } else {
                alert("Failed to create campaign.");
            }
        } catch(e) {
            console.error(e);
        }
    });
}

async function loadCampaigns() {
    try {
        const res = await fetch('/api/campaigns');
        const campaigns = await res.json();
        
        const container = document.getElementById('campaignsContainer');
        if (campaigns.length === 0) {
            container.innerHTML = '<p>No campaigns yet. Create one!</p>';
            return;
        }
        
        container.innerHTML = '';
        campaigns.forEach(c => {
            const div = document.createElement('div');
            div.className = 'campaign-card';
            div.innerHTML = `
                <h4>${c.title}</h4>
                <small>Created: ${new Date(c.created_at).toLocaleDateString()}</small>
            `;
            div.addEventListener('click', () => loadResponses(c));
            container.appendChild(div);
        });
    } catch(e) {
        console.error(e);
    }
}

async function loadResponses(campaign) {
    document.getElementById('responsesSection').style.display = 'block';
    document.getElementById('currentCampaignTitle').innerText = campaign.title;
    
    const linkEl = document.getElementById('publicLink');
    const link = `${window.location.origin}/feedback.html?c=${campaign.slug}`;
    linkEl.href = link;
    linkEl.innerText = link;
    
    try {
        const res = await fetch(`/api/responses/campaign/${campaign.id}`);
        const responses = await res.json();
        
        const container = document.getElementById('responsesContainer');
        if (responses.length === 0) {
            container.innerHTML = '<p>No responses yet.</p>';
            return;
        }
        
        container.innerHTML = '';
        responses.forEach(r => {
            const div = document.createElement('div');
            div.className = 'response-card';
            div.innerHTML = `
                <p><strong>Rating:</strong> ${r.answers.rating} / 5</p>
                <p><strong>Feedback:</strong> ${r.answers.text}</p>
                <small>${new Date(r.created_at).toLocaleString()}</small>
            `;
            container.appendChild(div);
        });
    } catch(e) {
        console.error(e);
    }
}


// --- Feedback Page Logic ---
async function initFeedbackPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('c');
    
    if (!slug) {
        document.getElementById('campaignTitle').innerText = "Invalid link";
        return;
    }
    
    try {
        const res = await fetch(`/api/campaigns/${slug}`);
        if (!res.ok) {
            document.getElementById('campaignTitle').innerText = "Campaign not found";
            return;
        }
        
        const campaign = await res.json();
        
        // Apply campaign settings
        document.getElementById('campaignTitle').innerText = campaign.title;
        document.getElementById('submitBtn').style.backgroundColor = campaign.brand_color;
        
        // Apply questions
        document.getElementById('labelQ1').innerText = campaign.questions.q1;
        document.getElementById('labelQ2').innerText = campaign.questions.q2;
        
        document.getElementById('feedbackForm').style.display = 'block';
        
        // Handle submit
        document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const ratingEl = document.querySelector('input[name="rating"]:checked');
            const rating = ratingEl ? ratingEl.value : null;
            const text = document.getElementById('textResponse').value;
            
            if (!rating) {
                alert("Please select a rating.");
                return;
            }
            
            try {
                const subRes = await fetch(`/api/responses/${slug}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        answers: { rating, text }
                    })
                });
                
                if (subRes.ok) {
                    document.getElementById('feedbackForm').style.display = 'none';
                    document.getElementById('successMessage').style.display = 'block';
                }
            } catch (err) {
                console.error(err);
                alert("Failed to submit feedback.");
            }
        });
        
    } catch (e) {
        console.error(e);
        document.getElementById('campaignTitle').innerText = "Error loading campaign";
    }
}
