// List of major timezones
const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Bangkok',
    'Asia/Hong_Kong',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Pacific/Auckland',
    'Pacific/Fiji',
    'America/Toronto',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'America/Buenos_Aires',
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Lagos',
    'Asia/Singapore',
    'Asia/Manila',
];

// DOM Elements
const dateInput = document.getElementById('dateInput');
const sourceTimezone = document.getElementById('sourceTimezone');
const useCurrentTimeBtn = document.getElementById('useCurrentTime');
const timezoneSearch = document.getElementById('timezoneSearch');
const addTimezoneBtn = document.getElementById('addTimezone');
const timezoneList = document.getElementById('timezoneList');

// State
let selectedTimezones = new Set();

// Initialize the app
function init() {
    populateTimezoneSelects();
    setCurrentDateTime();
    attachEventListeners();
    // Add a default timezone
    addTimezoneCard('Europe/London');
}

// Populate timezone select dropdowns
function populateTimezoneSelects() {
    sourceTimezone.innerHTML = TIMEZONES
        .map(tz => `<option value="${tz}">${tz}</option>`)
        .join('');
    sourceTimezone.value = 'UTC';
}

// Set current date and time in the input
function setCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    updateConversions();
}

// Attach event listeners
function attachEventListeners() {
    dateInput.addEventListener('change', updateConversions);
    sourceTimezone.addEventListener('change', updateConversions);
    useCurrentTimeBtn.addEventListener('click', setCurrentDateTime);
    addTimezoneBtn.addEventListener('click', handleAddTimezone);
    timezoneSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTimezone();
    });
}

// Handle adding a new timezone
function handleAddTimezone() {
    const searchValue = timezoneSearch.value.trim().toUpperCase();
    
    if (!searchValue) {
        alert('Please enter a timezone name');
        return;
    }

    // Find matching timezone
    const match = TIMEZONES.find(tz => tz.toUpperCase().includes(searchValue));
    
    if (!match) {
        alert('Timezone not found. Please check your spelling.');
        return;
    }

    if (selectedTimezones.has(match)) {
        alert('This timezone is already added');
        return;
    }

    addTimezoneCard(match);
    timezoneSearch.value = '';
    updateConversions();
}

// Add a timezone card to the list
function addTimezoneCard(timezone) {
    selectedTimezones.add(timezone);
    
    const card = document.createElement('div');
    card.className = 'timezone-card';
    card.id = `timezone-${timezone}`;
    
    card.innerHTML = `
        <div class="timezone-header">
            <span class="timezone-name">${timezone}</span>
            <button class="btn-remove" onclick="removeTimezone('${timezone}')">Remove</button>
        </div>
        <div class="timezone-time" id="time-${timezone}">--:--:--</div>
        <div class="timezone-offset" id="offset-${timezone}"></div>
    `;
    
    timezoneList.appendChild(card);
}

// Remove a timezone card
function removeTimezone(timezone) {
    selectedTimezones.delete(timezone);
    const card = document.getElementById(`timezone-${timezone}`);
    if (card) {
        card.remove();
    }
    updateConversions();
}

// Update all timezone conversions
function updateConversions() {
    if (!dateInput.value) return;

    const sourceDate = new Date(dateInput.value);
    const sourceOffset = getTimezoneOffset(sourceTimezone.value, sourceDate);
    
    selectedTimezones.forEach(timezone => {
        const targetOffset = getTimezoneOffset(timezone, sourceDate);
        const timeDiff = targetOffset - sourceOffset;
        const convertedDate = new Date(sourceDate.getTime() + timeDiff * 60 * 1000);
        
        const timeElement = document.getElementById(`time-${timezone}`);
        const offsetElement = document.getElementById(`offset-${timezone}`);
        
        if (timeElement) {
            timeElement.textContent = formatTime(convertedDate);
        }
        
        if (offsetElement) {
            offsetElement.textContent = `UTC ${formatOffset(targetOffset)}`;
        }
    });
}

// Get timezone offset in minutes
function getTimezoneOffset(timezone, date) {
    // Create a formatter for the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(date);
    const timezoneDate = new Date(
        parseInt(parts.find(p => p.type === 'year').value),
        parseInt(parts.find(p => p.type === 'month').value) - 1,
        parseInt(parts.find(p => p.type === 'day').value),
        parseInt(parts.find(p => p.type === 'hour').value),
        parseInt(parts.find(p => p.type === 'minute').value),
        parseInt(parts.find(p => p.type === 'second').value)
    );

    return -(timezoneDate.getTime() - date.getTime()) / (1000 * 60);
}

// Format time as HH:MM:SS
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Format offset as ±HH:MM
function formatOffset(minutes) {
    const sign = minutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return `${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Initialize app on load
document.addEventListener('DOMContentLoaded', init);
