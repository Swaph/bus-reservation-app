// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyATzQP79wTjWjifV-EX_s9h2_bkwjrN7Gc",
    authDomain: "bus-reservation-518cc.firebaseapp.com",
    projectId: "bus-reservation-518cc",
    storageBucket: "bus-reservation-518cc.firebasestorage.app",
    messagingSenderId: "436244294826",
    appId: "1:436244294826:web:01a0ca837061fcc56574d3",
    measurementId: "G-XN60DP64TQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); 