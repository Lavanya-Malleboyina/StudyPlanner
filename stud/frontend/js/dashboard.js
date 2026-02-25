document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard script loaded');
    
    // Check authentication
    if (!requireAuth()) {
        return;
    }

    console.log('User is authenticated, loading dashboard...');

    // DOM Elements
    const plansList = document.getElementById('plansList');
    const addPlanBtn = document.getElementById('addPlanBtn');
    const planModal = document.getElementById('planModal');
    const planForm = document.getElementById('planForm');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshQuoteBtn = document.getElementById('refreshQuote');
    const userNameSpan = document.getElementById('userName');
    const streakCount = document.getElementById('streakCount');
    const totalTasks = document.getElementById('totalTasks');
    const completedTasks = document.getElementById('completedTasks');
    const progressPercent = document.getElementById('progressPercent');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');

    // Check if all elements are found
    console.log('Dashboard elements found:', {
        plansList: !!plansList,
        addPlanBtn: !!addPlanBtn,
        planModal: !!planModal,
        logoutBtn: !!logoutBtn
    });

    // Initialize
    loadUserData();
    loadStudyPlans();
    loadProgress();
    loadQuote();

    // Event Listeners
    if (addPlanBtn) {
        addPlanBtn.addEventListener('click', openModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (refreshQuoteBtn) {
        refreshQuoteBtn.addEventListener('click', loadQuote);
    }

    if (planForm) {
        planForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await createStudyPlan();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === planModal) {
            closeModal();
        }
    });

    // Functions
    function loadUserData() {
        const userName = localStorage.getItem('userName') || 'Student';
        const userStreak = localStorage.getItem('userStreak') || '0';
        
        console.log('Loading user data:', { userName, userStreak });
        
        if (userNameSpan) {
            userNameSpan.textContent = `Hello, ${userName}`;
        }
        
        if (streakCount) {
            streakCount.textContent = userStreak;
        }
    }

    async function loadStudyPlans() {
        console.log('Loading study plans...');
        try {
            const plans = await apiRequest('/study');
            console.log('Study plans loaded:', plans);
            displayStudyPlans(plans);
        } catch (error) {
            console.error('Failed to load study plans:', error);
            showNotification('Failed to load study plans. Please try again.', 'error');
        }
    }

    async function loadProgress() {
        console.log('Loading progress...');
        try {
            const progress = await apiRequest('/study/progress/stats');
            console.log('Progress loaded:', progress);
            updateProgress(progress);
        } catch (error) {
            console.error('Failed to load progress:', error);
            // Set default values
            updateProgress({ total: 0, completed: 0, progress: 0 });
        }
    }

    async function loadQuote() {
        console.log('Loading quote...');
        try {
            const quote = await apiRequest('/study/quotes/random');
            console.log('Quote loaded:', quote);
            if (quoteText && quoteAuthor) {
                quoteText.textContent = `"${quote.text}"`;
                quoteAuthor.textContent = `- ${quote.author}`;
            }
        } catch (error) {
            console.error('Failed to load quote:', error);
            // Set default quote
            if (quoteText && quoteAuthor) {
                quoteText.textContent = `"The secret of getting ahead is getting started."`;
                quoteAuthor.textContent = `- Mark Twain`;
            }
        }
    }

    function displayStudyPlans(plans) {
        if (!plansList) return;

        if (!plans || plans.length === 0) {
            plansList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>No study plans yet</h3>
                    <p>Click "Add Plan" to create your first study plan!</p>
                </div>
            `;
            return;
        }

        plansList.innerHTML = plans.map(plan => `
            <div class="plan-item" data-id="${plan._id}" style="border-left-color: ${plan.color || '#3B82F6'}">
                <div class="plan-info">
                    <h4>${plan.subject}</h4>
                    <p>${plan.topic}</p>
                    <div class="plan-meta">
                        <span class="plan-duration">
                            <i class="fas fa-clock"></i> ${plan.duration} min
                        </span>
                        <span class="plan-priority ${plan.priority}">
                            ${plan.priority ? plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1) : 'Medium'}
                        </span>
                        ${plan.completed ? '<span class="plan-status completed"><i class="fas fa-check"></i> Completed</span>' : ''}
                    </div>
                </div>
                <div class="plan-actions">
                    <button class="btn-icon complete-btn" title="Mark as ${plan.completed ? 'incomplete' : 'complete'}">
                        <i class="fas ${plan.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="btn-icon delete-btn" title="Delete plan">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to action buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const planId = this.closest('.plan-item').dataset.id;
                await toggleComplete(planId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const planId = this.closest('.plan-item').dataset.id;
                await deleteStudyPlan(planId);
            });
        });
    }

    function updateProgress(progress) {
        if (!progress) progress = { total: 0, completed: 0, progress: 0 };
        
        console.log('Updating progress:', progress);
        
        if (totalTasks) totalTasks.textContent = progress.total || 0;
        if (completedTasks) completedTasks.textContent = progress.completed || 0;
        if (progressPercent) progressPercent.textContent = `${progress.progress || 0}%`;
        if (progressFill) progressFill.style.width = `${progress.progress || 0}%`;
        if (progressText) progressText.textContent = `${progress.progress || 0}% Complete`;
    }

    function openModal() {
        console.log('Opening modal');
        if (planModal) {
            planModal.style.display = 'block';
        }
    }

    function closeModal() {
        console.log('Closing modal');
        if (planModal) {
            planModal.style.display = 'none';
        }
        if (planForm) {
            planForm.reset();
        }
    }

    async function createStudyPlan() {
        if (!planForm) return;

        const formData = {
            subject: document.getElementById('subject').value,
            topic: document.getElementById('topic').value,
            duration: parseInt(document.getElementById('duration').value),
            priority: document.getElementById('priority').value,
            color: document.getElementById('color').value
        };

        console.log('Creating study plan:', formData);

        try {
            await apiRequest('/study', {
                method: 'POST',
                body: formData
            });

            showNotification('Study plan created successfully!', 'success');
            closeModal();
            await loadStudyPlans();
            await loadProgress();
        } catch (error) {
            console.error('Failed to create study plan:', error);
            showNotification('Failed to create study plan: ' + error.message, 'error');
        }
    }

    async function toggleComplete(planId) {
        console.log('Toggling completion for plan:', planId);
        try {
            // First get the current plan
            const plans = await apiRequest('/study');
            const plan = plans.find(p => p._id === planId);
            
            if (!plan) {
                throw new Error('Plan not found');
            }

            // Toggle completion status
            const updatedPlan = await apiRequest(`/study/${planId}`, {
                method: 'PUT',
                body: { completed: !plan.completed }
            });

            showNotification(`Plan marked as ${updatedPlan.completed ? 'completed' : 'incomplete'}!`, 'success');
            await loadStudyPlans();
            await loadProgress();
        } catch (error) {
            console.error('Failed to update plan:', error);
            showNotification('Failed to update plan: ' + error.message, 'error');
        }
    }

    async function deleteStudyPlan(planId) {
        console.log('Deleting plan:', planId);
        if (!confirm('Are you sure you want to delete this study plan?')) {
            return;
        }

        try {
            await apiRequest(`/study/${planId}`, {
                method: 'DELETE'
            });

            showNotification('Study plan deleted successfully!', 'success');
            await loadStudyPlans();
            await loadProgress();
        } catch (error) {
            console.error('Failed to delete study plan:', error);
            showNotification('Failed to delete study plan: ' + error.message, 'error');
        }
    }

    function logout() {
        console.log('Logging out...');
        localStorage.removeItem('studyPlannerToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userStreak');
        showNotification('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    }

    // Test all functions on load
    console.log('Dashboard initialization complete');
});