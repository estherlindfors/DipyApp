'use strict';

// Declare storedFilterParams at the top of script scope (FE-JS-RSLT-AI-002)
let storedFilterParams = null;
let isCurrentlyTruncated = true; // Track truncation state

// Add DOMContentLoaded event listener (FE-JS-RSLT-AI-001)
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM references (FE-JS-RSLT-AI-002)
    const activityTitleElement = document.getElementById('activity-title');
    const activityImageElement = document.getElementById('activity-image');
    const activityDescriptionElement = document.getElementById('activity-description');
    const activityTagsElement = document.getElementById('activity-tags');
    const regenerateActivityBtn = document.getElementById('regenerate-activity-btn');
    const resultMessageArea = document.getElementById('result-message-area');
    const toggleDescriptionBtn = document.getElementById('toggle-description-btn');
    const shareActivityBtn = document.getElementById('share-activity-btn');

    // Retrieve data (FE-JS-RSLT-AI-003, FE-JS-RSLT-AI-004)
    const activityData = JSON.parse(sessionStorage.getItem('activityResult'));
    storedFilterParams = JSON.parse(sessionStorage.getItem('filterParams'));

    // Data validation (FE-JS-RSLT-AI-005)
    if (!activityData || !storedFilterParams) {
        window.location.href = 'index.html';
        return;
    }

    // Function to update description display
    function updateDescriptionDisplay() {
        const fullText = activityDescriptionElement.dataset.fullText || "";
        const firstLineBreakIdx = fullText.indexOf('\n');
        let canBeTruncated = false;
        let textToShow = fullText;

        if (firstLineBreakIdx > 0 && firstLineBreakIdx < fullText.length - 1) {
            canBeTruncated = true;
        }

        if (isCurrentlyTruncated && canBeTruncated) {
            textToShow = fullText.substring(0, firstLineBreakIdx);
            toggleDescriptionBtn.textContent = 'Read more';
            toggleDescriptionBtn.classList.remove('hidden');
        } else {
            textToShow = fullText;
            if (canBeTruncated) {
                toggleDescriptionBtn.textContent = 'Hide';
                toggleDescriptionBtn.classList.remove('hidden');
            } else {
                toggleDescriptionBtn.classList.add('hidden');
            }
        }
        activityDescriptionElement.textContent = textToShow;
    }

    // Add click event listener for toggle description button
    toggleDescriptionBtn.addEventListener('click', () => {
        isCurrentlyTruncated = !isCurrentlyTruncated;
        updateDescriptionDisplay();
    });

    // Render function (FE-JS-RSLT-AI-006)
    function displayActivity(activity) {
        activityTitleElement.textContent = activity.title;
        activityImageElement.src = activity.image_url;
        activityImageElement.alt = activity.title;
        
        // Store full description and update display
        activityDescriptionElement.dataset.fullText = activity.description;
        isCurrentlyTruncated = true;
        updateDescriptionDisplay();
        
        // Clear and populate tags
        activityTagsElement.innerHTML = '';
        activity.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full';
            tagSpan.textContent = tag;
            activityTagsElement.appendChild(tagSpan);
        });

        // Check for Web Share API support and show/hide share button
        if (navigator.share) {
            shareActivityBtn.classList.remove('hidden');
        } else {
            shareActivityBtn.classList.add('hidden');
            console.log('Web Share API not supported on this browser.');
        }
    }

    // Add click event listener for share button
    shareActivityBtn.addEventListener('click', async () => {
        const currentActivity = JSON.parse(sessionStorage.getItem('activityResult'));
        if (!currentActivity) {
            console.error('No activity data found in session storage to share.');
            resultMessageArea.innerHTML = '<span class="text-red-600">Error: No activity data available to share.</span>';
            return;
        }

        const shareData = {
            title: currentActivity.title || 'Check out this activity from Dipy!',
            text: currentActivity.description || 'I found a fun activity suggestion on Dipy.',
            url: window.location.href
        };

        try {
            await navigator.share(shareData);
            console.log('Activity shared successfully');
            resultMessageArea.innerHTML = '<span class="text-green-600">Activity shared successfully!</span>';
            setTimeout(() => {
                resultMessageArea.innerHTML = '';
            }, 3000);
        } catch (err) {
            console.error('Error sharing activity:', err);
            if (err.name !== 'AbortError') {
                resultMessageArea.innerHTML = '<span class="text-red-600">Error sharing activity. Please try again.</span>';
                setTimeout(() => {
                    resultMessageArea.innerHTML = '';
                }, 3000);
            }
        }
    });

    // Initial display (FE-JS-RSLT-AI-007)
    displayActivity(activityData);

    // Regenerate listener (FE-JS-RSLT-AI-008)
    regenerateActivityBtn.addEventListener('click', async () => {
        // Regenerate handler (FE-JS-RSLT-AI-009)
        if (!storedFilterParams) {
            resultMessageArea.innerHTML = '<span class="text-red-600">Error: No filter parameters available.</span>';
            return;
        }

        resultMessageArea.innerHTML = '<span class="text-gray-600">Generating another activity...</span>';
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