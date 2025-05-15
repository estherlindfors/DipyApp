'use strict';

// Declare storedFilterParams at the top of script scope (FE-JS-RSLT-AI-002)
let storedFilterParams = null;

// Add DOMContentLoaded event listener (FE-JS-RSLT-AI-001)
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM references (FE-JS-RSLT-AI-002)
    const activityTitleElement = document.getElementById('activity-title');
    const activityImageElement = document.getElementById('activity-image');
    const activityDescriptionElement = document.getElementById('activity-description');
    const activityTagsElement = document.getElementById('activity-tags');
    const regenerateActivityBtn = document.getElementById('regenerate-activity-btn');
    const resultMessageArea = document.getElementById('result-message-area');

    // Retrieve data (FE-JS-RSLT-AI-003, FE-JS-RSLT-AI-004)
    const activityData = JSON.parse(sessionStorage.getItem('activityResult'));
    storedFilterParams = JSON.parse(sessionStorage.getItem('filterParams'));

    // Data validation (FE-JS-RSLT-AI-005)
    if (!activityData || !storedFilterParams) {
        window.location.href = 'index.html';
        return;
    }

    // Render function (FE-JS-RSLT-AI-006)
    function displayActivity(activity) {
        activityTitleElement.textContent = activity.title;
        activityImageElement.src = activity.image_url;
        activityImageElement.alt = activity.title;
        activityDescriptionElement.textContent = activity.description;
        
        // Clear and populate tags
        activityTagsElement.innerHTML = '';
        activity.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full shadow-sm';
            tagSpan.textContent = tag;
            activityTagsElement.appendChild(tagSpan);
        });
    }

    // Initial display (FE-JS-RSLT-AI-007)
    displayActivity(activityData);

    // Regenerate listener (FE-JS-RSLT-AI-008)
    regenerateActivityBtn.addEventListener('click', async () => {
        // Regenerate handler (FE-JS-RSLT-AI-009)
        if (!storedFilterParams) {
            resultMessageArea.innerHTML = '<span class="text-red-600">Error: No filter parameters available.</span>';
            return;
        }

        resultMessageArea.innerHTML = '<span class="text-blue-600">Generating another activity...</span>';
        regenerateActivityBtn.disabled = true;

        try {
            // Construct query params
            const queryParams = new URLSearchParams();
            Object.entries(storedFilterParams).forEach(([key, value]) => {
                if (value !== 'Any') {
                    queryParams.append(key, value);
                }
            });

            // Make API call
            const response = await fetch(`/api/activity?${queryParams.toString()}`);

            // Handle regenerate response (FE-JS-RSLT-AI-010)
            if (!response.ok) {
                const jsonError = await response.json();
                resultMessageArea.innerHTML = `<span class="text-red-600">${jsonError.message || 'Error generating new activity.'}</span>`;
                regenerateActivityBtn.disabled = false;
                return;
            }

            const newActivityData = await response.json();
            displayActivity(newActivityData);
            sessionStorage.setItem('activityResult', JSON.stringify(newActivityData));
            resultMessageArea.innerHTML = '';
            regenerateActivityBtn.disabled = false;

        } catch (error) {
            // Handle regenerate fetch error (FE-JS-RSLT-AI-011)
            console.error('Error:', error);
            resultMessageArea.innerHTML = '<span class="text-red-600">Network error. Please try again.</span>';
            regenerateActivityBtn.disabled = false;
        }
    });
}); 