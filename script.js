document.addEventListener('DOMContentLoaded', () => {
    // Set dark mode by default
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', localStorage.getItem('theme'));
    }

    // Hamburger Menu
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });
    }

    // Smooth Scrolling
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Dark Mode Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
        });
    }

    // Typing Effect
    const phrases = ['Aspiring Software Engineer', 'Web Developer', 'Problem Solver'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.querySelector('.typing-effect');

    if (typingElement) {
        function type() {
            const currentPhrase = phrases[phraseIndex];
            if (isDeleting) {
                typingElement.textContent = currentPhrase.substring(0, charIndex--);
                if (charIndex < 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                }
            } else {
                typingElement.textContent = currentPhrase.substring(0, charIndex++);
                if (charIndex > currentPhrase.length) {
                    isDeleting = true;
                    setTimeout(type, 1500);
                    return;
                }
            }
            setTimeout(type, isDeleting ? 50 : 100);
        }
        type();
    }

    // Intersection Observer for Section Fade-In
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));

    // BMI Calculator (on bmi.html)
    const bmiForm = document.getElementById('bmi-form');
    const bmiResult = document.getElementById('bmi-result');
    if (bmiForm && bmiResult) {
        bmiForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const heightInput = parseFloat(document.getElementById('height').value);
            const weightInput = parseFloat(document.getElementById('weight').value);
            const heightUnit = document.getElementById('height-unit').value;
            const weightUnit = document.getElementById('weight-unit').value;

            if (isNaN(heightInput) || isNaN(weightInput) || heightInput <= 0 || weightInput <= 0) {
                bmiResult.textContent = 'Please enter valid positive numbers for height and weight.';
                bmiResult.style.color = 'red';
                return;
            }

            let heightInMeters = heightInput;
            if (heightUnit === 'cm') heightInMeters /= 100;
            else if (heightUnit === 'inches') heightInMeters *= 0.0254;
            else if (heightUnit === 'feet') heightInMeters *= 0.3048;

            let weightInKg = weightInput;
            if (weightUnit === 'pounds') weightInKg /= 2.20462;

            const bmi = weightInKg / (heightInMeters ** 2);
            let category = '';
            let color = '';
            if (bmi < 18.5) {
                category = 'Underweight';
                color = 'orange';
            } else if (bmi < 25) {
                category = 'Normal';
                color = 'green';
            } else {
                category = 'Overweight';
                color = 'red';
            }

            bmiResult.textContent = `Your BMI is ${bmi.toFixed(1)} (${category}).`;
            bmiResult.style.color = color;
        });
    }

    // Weather Predictor (on weather.html)
    const weatherForm = document.getElementById('weather-form');
    const weatherResult = document.getElementById('weather-result');
    const cityInput = document.getElementById('city');
    const suggestionsDiv = document.getElementById('suggestions');
    if (weatherForm && weatherResult && cityInput && suggestionsDiv) {
        // Fetch weather and forecast on form submit
        weatherForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const city = cityInput.value.trim();
            if (!city) {
                weatherResult.innerHTML = '<p style="color: red;">Please enter a city name.</p>';
                return;
            }

            const apiKey = '5a16b60e6a52c8993e16174d49bd966d'; // Your API key (consider env var for production)
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
            let lat, lon;

            try {
                const geoResponse = await fetch(geoUrl);
                if (!geoResponse.ok) throw new Error(`Geo API error: ${geoResponse.status}`);
                const geoData = await geoResponse.json();
                if (geoData.length === 0) throw new Error('City not found. Please try another.');
                lat = geoData[0].lat;
                lon = geoData[0].lon;

                // Fetch current weather
                const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                const currentResponse = await fetch(currentUrl);
                if (!currentResponse.ok) throw new Error(`Current weather error: ${currentResponse.status}`);
                const currentData = await currentResponse.json();

                // Fetch 5-day forecast
                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                const forecastResponse = await fetch(forecastUrl);
                if (!forecastResponse.ok) throw new Error(`Forecast error: ${forecastResponse.status}`);
                const forecastData = await forecastResponse.json();

                // Display current weather
                let html = `
                    <div class="forecast-day">
                        <h3>Current Weather in ${currentData.name}</h3>
                        <p>Temperature: ${currentData.main.temp}°C</p>
                        <p>Condition: ${currentData.weather[0].description}</p>
                        <img src="http://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png" alt="Current weather icon">
                    </div>
                `;

                // Group forecast by day and select entry closest to noon
                const forecastsByDay = {};
                forecastData.list.forEach(item => {
                    const itemDate = new Date(item.dt * 1000);
                    const dateKey = itemDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                    if (!forecastsByDay[dateKey]) {
                        forecastsByDay[dateKey] = [];
                    }
                    forecastsByDay[dateKey].push(item);
                });

                // Get next 3 unique days
                const forecastDays = Object.keys(forecastsByDay).slice(0, 3);
                forecastDays.forEach(day => {
                    const dayItems = forecastsByDay[day];
                    let bestItem = dayItems[0]; // Default to first
                    let bestDiff = Infinity;
                    const targetHour = 12;

                    dayItems.forEach(item => {
                        const hour = new Date(item.dt * 1000).getHours();
                        const diff = Math.abs(hour - targetHour);
                        if (diff < bestDiff) {
                            bestDiff = diff;
                            bestItem = item;
                        }
                    });

                    html += `
                        <div class="forecast-day">
                            <h3>${day}</h3>
                            <p>Temperature: ${bestItem.main.temp}°C</p>
                            <p>Condition: ${bestItem.weather[0].description}</p>
                            <img src="http://openweathermap.org/img/wn/${bestItem.weather[0].icon}@2x.png" alt="Forecast weather icon for ${day}">
                        </div>
                    `;
                });

                weatherResult.innerHTML = html;
                suggestionsDiv.style.display = 'none'; // Hide suggestions
            } catch (error) {
                weatherResult.innerHTML = `<p style="color: red;">Error: ${error.message}. Please try again.</p>`;
            }
        });

        // Fetch and display city suggestions
        cityInput.addEventListener('input', async () => {
            const query = cityInput.value.trim();
            if (query.length < 2) {
                suggestionsDiv.style.display = 'none';
                return;
            }

            const apiKey = '5a16b60e6a52c8993e16174d49bd966d';
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

            try {
                const response = await fetch(geoUrl);
                if (!response.ok) throw new Error(`Suggestion API error: ${response.status}`);
                const cities = await response.json();

                suggestionsDiv.innerHTML = '';
                if (cities.length > 0) {
                    cities.forEach(city => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.className = 'suggestion-item';
                        suggestionItem.textContent = `${city.name}, ${city.state ? city.state + ', ' : ''}${city.country}`;
                        suggestionItem.addEventListener('click', () => {
                            cityInput.value = city.name;
                            suggestionsDiv.style.display = 'none';
                            weatherForm.dispatchEvent(new Event('submit')); // Trigger fetch
                        });
                        suggestionsDiv.appendChild(suggestionItem);
                    });
                    suggestionsDiv.style.display = 'block';
                } else {
                    suggestionsDiv.style.display = 'none';
                }
            } catch (error) {
                suggestionsDiv.style.display = 'none';
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!weatherForm.contains(e.target)) {
                suggestionsDiv.style.display = 'none';
            }
        });
    }

    // Contact Modal (updated with EmailJS)
    const contactIcon = document.querySelector('.contact-icon');
    const contactModal = document.getElementById('contact-modal');
    const contactForm = document.getElementById('contact-form');
    const contactModalClose = document.querySelector('#contact-modal .modal-close');

    if (contactIcon && contactModal && contactForm && contactModalClose) {
        contactIcon.addEventListener('click', () => {
            contactModal.style.display = 'flex';
        });

        contactModalClose.addEventListener('click', () => {
            contactModal.style.display = 'none';
        });

        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                contactModal.style.display = 'none';
            }
        });

        // Initialize EmailJS with your Public Key
        emailjs.init("0iwYwCIjvcpO1UDGy");  // Your Public Key

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (name && email && message) {
                emailjs.send("service_4xdz37j", "template_ucf0jxe", {  // Your Service ID and Template ID
                    name: name,
                    email: email,
                    message: message
                }).then((response) => {
                    alert('Message sent successfully! Thank you.');
                    contactForm.reset();
                    contactModal.style.display = 'none';
                }, (error) => {
                    alert('Failed to send message. Please try again or check your email settings.');
                    console.error('EmailJS error:', error);
                });
            } else {
                alert('Please fill out all fields.');
            }
        });
    }

    // Resume Modal
    const resumeLinks = document.querySelectorAll('.resume-link');
    const resumeModal = document.getElementById('resume-modal');
    const resumeModalClose = document.querySelector('#resume-modal .modal-close');

    if (resumeLinks && resumeModal && resumeModalClose) {
        resumeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                resumeModal.style.display = 'flex';
            });
        });

        resumeModalClose.addEventListener('click', () => {
            resumeModal.style.display = 'none';
        });

        resumeModal.addEventListener('click', (e) => {
            if (e.target === resumeModal) {
                resumeModal.style.display = 'none';
            }
        });
    }

    // Chat Modal (with debug logs)
    const chatIcon = document.querySelector('.chat-icon');
    const chatModal = document.getElementById('chat-modal');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatHistory = document.getElementById('chat-history');
    const chatModalClose = document.querySelector('#chat-modal .modal-close');

    console.log('Chat elements:', { chatIcon, chatModal, chatForm, chatInput, chatHistory, chatModalClose });  // Debug: Check if elements exist

    if (chatIcon && chatModal && chatForm && chatInput && chatHistory && chatModalClose) {
        chatIcon.addEventListener('click', () => {
            console.log('Chat icon clicked!');  // Debug
            chatModal.style.display = 'flex';
        });

        chatModalClose.addEventListener('click', () => {
            chatModal.style.display = 'none';
        });

        chatModal.addEventListener('click', (e) => {
            if (e.target === chatModal) {
                chatModal.style.display = 'none';
            }
        });

        



    } else {
        console.error('Missing chat elements - check HTML!');  // Debug
    }

    function appendMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', type);
        messageDiv.textContent = text;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

});