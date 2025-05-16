'use strict';

// Form handling will be implemented in subsequent tasks
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM element references (FE-JS-IDX-AI-001)
    const filterForm = document.getElementById('filter-form');
    const generateBtn = document.getElementById('generate-btn');
    const messageArea = document.getElementById('message-area');
    const participantsFilter = document.getElementById('participants-filter');
    const priceFilter = document.getElementById('price-filter');
    const exertionFilter = document.getElementById('exertion-filter');

    // Get references for collapsible filters (FE-JS-IDX-COL-001)
    const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
    const additionalFiltersContainer = document.getElementById('additional-filters-container');

    // Add toggle filters button click handler (FE-JS-IDX-COL-002, FE-JS-IDX-COL-003)
    toggleFiltersBtn.addEventListener('click', () => {
        const isHidden = additionalFiltersContainer.classList.contains('hidden');
        if (isHidden) {
            additionalFiltersContainer.classList.remove('hidden');
            toggleFiltersBtn.textContent = 'Hide Filters';
        } else {
            additionalFiltersContainer.classList.add('hidden');
            toggleFiltersBtn.textContent = '+ Filters';
        }
    });

    // Add form submit event listener (FE-JS-IDX-AI-002)
    filterForm.addEventListener('submit', async (event) => {
        // Prevent default form submission (FE-JS-IDX-AI-003)
        event.preventDefault();

        // Set loading state (FE-JS-IDX-AI-004)
        messageArea.innerHTML = '<span class="text-gray-600">Finding an activity...</span>';
        generateBtn.disabled = true;

        try {
            // Collect filter values (FE-JS-IDX-AI-005)
            const filterSelections = {
                location: document.querySelector('input[name="location"]:checked').value,
                participants: participantsFilter.value,
                environment: document.querySelector('input[name="environment"]:checked').value,
                price: priceFilter.value,
                exertion: exertionFilter.value
            };

            // Construct query params (FE-JS-IDX-AI-006)
            const queryParams = new URLSearchParams();
            Object.entries(filterSelections).forEach(([key, value]) => {
                if (value !== 'Any') {
                    queryParams.append(key, value);
                }
            });

            // Make API call (FE-JS-IDX-AI-007)
            const response = await fetch(`/api/activity?${queryParams.toString()}`);

            // Handle API response (FE-JS-IDX-AI-008)
            if (!response.ok) {
                const jsonError = await response.json();
                messageArea.innerHTML = `<span class="text-red-600">${jsonError.message || 'Error finding activity.'}</span>`;
                generateBtn.disabled = false;
                return;
            }

            // Store data on success (FE-JS-IDX-AI-009)
            const activityData = await response.json();
            sessionStorage.setItem('activityResult', JSON.stringify(activityData));

            // Store filters (FE-JS-IDX-AI-010)
            sessionStorage.setItem('filterParams', JSON.stringify(filterSelections));

            // Redirect to result page (FE-JS-IDX-AI-011)
            window.location.href = 'result.html';

        } catch (error) {
            // Handle fetch errors (FE-JS-IDX-AI-012)
            console.error('Error:', error);
            messageArea.innerHTML = '<span class="text-red-600">Network error. Please try again.</span>';
            generateBtn.disabled = false;
        }
    });
}); 