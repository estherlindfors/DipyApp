'use strict';

// City coordinates and distance threshold
const cityCoordinates = {
    stockholm: { lat: 59.3293, lon: 18.0686 },
    gothenburg: { lat: 57.7089, lon: 11.9746 }
};
const MAX_DISTANCE_KM = 50; // Max distance in km to be considered "near" a city

// Haversine distance calculation
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// Helper function to select a location radio button
function selectLocationRadio(cityValue) {
    const radio = document.querySelector(`input[name="location"][value="${cityValue}"]`);
    if (radio) {
        radio.checked = true;
    }
}

// Set default location based on geolocation
function setDefaultLocation() {
    const geolocationStatus = document.getElementById('geolocation-status');
    const locationRadios = document.querySelectorAll('input[name="location"]');

    if (!navigator.geolocation) {
        geolocationStatus.textContent = 'Geolocation not supported. Defaulting to "Anywhere".';
        selectLocationRadio('Anywhere');
        return;
    }

    const options = {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0
    };

    function successCallback(position) {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        geolocationStatus.textContent = 'Determining closest city...';

        const distStockholm = getDistanceFromLatLonInKm(
            userLat, userLon,
            cityCoordinates.stockholm.lat, cityCoordinates.stockholm.lon
        );
        const distGothenburg = getDistanceFromLatLonInKm(
            userLat, userLon,
            cityCoordinates.gothenburg.lat, cityCoordinates.gothenburg.lon
        );

        if (distStockholm <= MAX_DISTANCE_KM && distGothenburg <= MAX_DISTANCE_KM) {
            // User is near both cities, select the closer one
            if (distStockholm < distGothenburg) {
                selectLocationRadio('Stockholm');
                geolocationStatus.textContent = 'Location automatically set to Stockholm.';
            } else {
                selectLocationRadio('Gothenburg');
                geolocationStatus.textContent = 'Location automatically set to Gothenburg.';
            }
        } else if (distStockholm <= MAX_DISTANCE_KM) {
            selectLocationRadio('Stockholm');
            geolocationStatus.textContent = 'Location automatically set to Stockholm.';
        } else if (distGothenburg <= MAX_DISTANCE_KM) {
            selectLocationRadio('Gothenburg');
            geolocationStatus.textContent = 'Location automatically set to Gothenburg.';
        } else {
            selectLocationRadio('Anywhere');
            geolocationStatus.textContent = 'Location set to "Anywhere" as you are not near Stockholm or Gothenburg.';
        }

        // Clear status message after 3 seconds
        setTimeout(() => {
            geolocationStatus.textContent = '';
        }, 3000);
    }

    function errorCallback(error) {
        let errorMessage = '';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied. Defaulting to "Anywhere".';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable. Defaulting to "Anywhere".';
                break;
            case error.TIMEOUT:
                errorMessage = 'Location request timed out. Defaulting to "Anywhere".';
                break;
            default:
                errorMessage = 'An error occurred while getting your location. Defaulting to "Anywhere".';
        }
        geolocationStatus.textContent = errorMessage;
        selectLocationRadio('Anywhere');

        // Clear error message after 3 seconds
        setTimeout(() => {
            geolocationStatus.textContent = '';
        }, 3000);
    }

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
}

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

    // Set default location based on geolocation
    setDefaultLocation();

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