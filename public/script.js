// Global variables
let progressData = null;
const API_BASE_URL = window.location.origin;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProgressData();
});

// Load progress data from the API
async function loadProgressData() {
    try {
        const response = await fetch(`${API_BASE_URL}/progress`);
        if (!response.ok) {
            throw new Error('Failed to load progress data');
        }
        
        progressData = await response.json();
        renderUI();
        hideLoading();
    } catch (error) {
        console.error('Error loading progress data:', error);
        showError('Failed to load progress data. Please refresh the page.');
    }
}

// Render the entire UI
function renderUI() {
    if (!progressData) return;
    
    renderOverallProgress();
    renderUserProgress('Khare', 'khare-content');
    renderUserProgress('Roy', 'roy-content');
}

// Render overall progress bars
function renderOverallProgress() {
    const khareProgress = calculateOverallProgress('Khare');
    const royProgress = calculateOverallProgress('Roy');
    
    updateProgressBar('khare-overall-progress', khareProgress, 'bg-success');
    updateProgressBar('roy-overall-progress', royProgress, 'bg-info');
}

// Calculate overall progress for a user
function calculateOverallProgress(user) {
    let totalSubtopics = 0;
    let completedSubtopics = 0;
    
    progressData.book.forEach(chapter => {
        chapter.subtopics.forEach(subtopic => {
            totalSubtopics++;
            if (subtopic[user]) {
                completedSubtopics++;
            }
        });
    });
    
    return totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;
}

// Update a progress bar element
function updateProgressBar(elementId, percentage, bgClass) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.width = `${percentage}%`;
        element.textContent = `${percentage}%`;
        element.className = `progress-bar ${bgClass}`;
    }
}

// Render progress for a specific user
function renderUserProgress(user, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '';
    
    progressData.book.forEach(chapter => {
        const chapterProgress = calculateChapterProgress(chapter, user);
        
        html += `
            <div class="chapter-section">
                <div class="chapter-header">
                    ${chapter.chapter}
                </div>
                <div class="chapter-progress">
                    <div class="progress">
                        <div class="progress-bar ${user === 'Khare' ? 'bg-success' : 'bg-info'}" 
                             role="progressbar" 
                             style="width: ${chapterProgress}%">
                            ${chapterProgress}%
                        </div>
                    </div>
                </div>
                <div class="subtopics-container">
        `;
        
        chapter.subtopics.forEach(subtopic => {
            const isCompleted = subtopic[user];
            html += `
                <div class="subtopic-row">
                    <div class="subtopic-title">${subtopic.title}</div>
                    <div class="checkbox-container">
                        <div class="checkbox-wrapper ${user.toLowerCase()}-checkbox">
                            <input type="checkbox" 
                                   id="${user.toLowerCase()}-${subtopic.id}" 
                                   ${subtopic[user] ? 'checked' : ''}
                                   onchange="updateProgress('${user}', '${subtopic.id}', this.checked)">
                            <label for="${user.toLowerCase()}-${subtopic.id}">${user}</label>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Calculate progress for a specific chapter and user
function calculateChapterProgress(chapter, user) {
    const totalSubtopics = chapter.subtopics.length;
    const completedSubtopics = chapter.subtopics.filter(subtopic => subtopic[user]).length;
    return totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;
}

// Update progress for a subtopic
async function updateProgress(user, subtopicId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/progress/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: user,
                subtopicId: subtopicId,
                status: status
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update progress');
        }
        
        // Update local data
        const updatedChapter = await response.json();
        updateLocalData(updatedChapter);
        
        // Re-render UI
        renderUI();
        
        // Show success feedback
        showSuccessFeedback(user, subtopicId, status);
        
    } catch (error) {
        console.error('Error updating progress:', error);
        showError('Failed to update progress. Please try again.');
        
        // Revert checkbox state
        const checkbox = document.getElementById(`${user.toLowerCase()}-${subtopicId}`);
        if (checkbox) {
            checkbox.checked = !status;
        }
    }
}

// Update local data with the updated chapter
function updateLocalData(updatedChapter) {
    if (!progressData) return;
    
    const chapterIndex = progressData.book.findIndex(chapter => 
        chapter.chapter === updatedChapter.chapter
    );
    
    if (chapterIndex !== -1) {
        progressData.book[chapterIndex] = updatedChapter;
    }
}

// Show success feedback
function showSuccessFeedback(user, subtopicId, status) {
    const action = status ? 'completed' : 'unchecked';
    const color = user === 'Khare' ? 'success' : 'info';
    
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${color} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    toast.innerHTML = `
        <strong>${user}</strong> ${action} "${getSubtopicTitle(subtopicId)}"
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Get subtopic title by ID
function getSubtopicTitle(subtopicId) {
    for (const chapter of progressData.book) {
        const subtopic = chapter.subtopics.find(s => s.id === subtopicId);
        if (subtopic) {
            return subtopic.title;
        }
    }
    return subtopicId;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    errorDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    errorDiv.innerHTML = `
        <strong>Error:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Hide loading spinner
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Show loading spinner
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
}
