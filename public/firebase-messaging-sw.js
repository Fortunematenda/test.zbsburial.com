importScripts("https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js");
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Firebase Configuration

const firebaseConfig = {
    apiKey: "AIzaSyBwGgKI26k5xuzfnDetJdDb1caDG1z1vys",
    authDomain: "fortai-7d627.firebaseapp.com",
    projectId: "fortai-7d627",
    storageBucket: "fortai-7d627.appspot.com",
    messagingSenderId: "701202336945",
    appId: "1:701202336945:android:787548d1de86164643a690"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();


// Background Message Handling
messaging.onBackgroundMessage((payload) => {
    console.log("Received background message: ", payload);
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/firebase-logo.png"
    });
});
self.__BUILD_MANIFEST=function(s,c,a,e,t,i,r,u,f,n,b,d,p,o,h,k){return{__rewrites:{afterFiles:[],beforeFiles:[],fallback:[]},"/":[e,t,s,c,"static/chunks/565-271eddd2c9cab4fb.js",i,"static/chunks/pages/index-94bf7936ff1dc3e0.js"],"/_error":["static/chunks/pages/_error-d8e38e46627e730b.js"],"/choose-plan":[r,s,a,"static/chunks/pages/choose-plan-4f8d682ad141dab9.js"],"/extractor":[u,a,f,b,d,h,n,"static/chunks/pages/extractor-33de5219b738b5a4.js"],"/finder":[u,"static/chunks/9f4ff23f-3df988e73eed557d.js",a,f,b,d,"static/css/b20cdbd4127ad642.css","static/chunks/252-3414982915621ce0.js",n,"static/chunks/pages/finder-0122cc3ef2090a28.js"],"/forgot-password":[p,s,c,"static/chunks/pages/forgot-password-e6b96070261a75b4.js"],"/login":[p,k,s,c,"static/chunks/pages/login-151205ba8f988f99.js"],"/overview":["static/chunks/pages/overview-bf006645078b4075.js"],"/pricing":[e,r,t,s,c,i,"static/chunks/pages/pricing-ce6adf281a50e7d7.js"],"/privacy":[e,t,s,c,i,o,"static/chunks/pages/privacy-4d956187926f3915.js"],"/profile":[r,a,"static/chunks/pages/profile-100d4d3868af983b.js"],"/purchase-successful":["static/chunks/pages/purchase-successful-79db556e03e3968b.js"],"/register":[r,p,k,s,c,"static/chunks/pages/register-818b4d944d035e03.js"],"/registration-successful":["static/chunks/pages/registration-successful-6359dd1895c7786b.js"],"/reset-password":[r,s,"static/chunks/pages/reset-password-cc5e2eb68e171f7f.js"],"/subscription":[r,a,"static/chunks/pages/subscription-bf6ff142d475a0de.js"],"/subscription-update-successful":["static/chunks/pages/subscription-update-successful-5a68cb9bdd610ae6.js"],"/tasks":[u,"static/chunks/c16184b3-cde9816439167892.js",a,f,d,"static/chunks/614-0f672981d67e45c4.js",n,"static/chunks/pages/tasks-1cecfa500ed63cb2.js"],"/terms":[e,t,s,c,i,o,"static/chunks/pages/terms-dad2b09f9d44022f.js"],"/trial-successful":["static/chunks/pages/trial-successful-5ad6dc0ac0b6b839.js"],"/validator":[u,a,f,b,h,n,"static/chunks/pages/validator-b20bb1036f48e1fc.js"],"/verify-account":["static/chunks/pages/verify-account-4c43224f8a3c57e3.js"],"/version-2-0":[e,t,s,c,i,"static/chunks/pages/version-2-0-c3c96b04a7a5066a.js"],"/white-label":[e,t,s,c,i,o,"static/chunks/pages/white-label-f04c60fac5da9e8e.js"],sortedPages:["/","/_app","/_error","/choose-plan","/extractor","/finder","/forgot-password","/login","/overview","/pricing","/privacy","/profile","/purchase-successful","/register","/registration-successful","/reset-password","/subscription","/subscription-update-successful","/tasks","/terms","/trial-successful","/validator","/verify-account","/version-2-0","/white-label"]}}("static/chunks/949-888e8687d7d04d4e.js","static/chunks/664-fe029c8b38e64ec1.js","static/chunks/532-809c56446e161a9d.js","static/chunks/fea29d9f-89ee17bf2a9e206d.js","static/chunks/68c0a17d-cf67b7b5276f1283.js","static/chunks/270-80d06450b51ade75.js","static/chunks/41155975-c0ae98fe47802510.js","static/chunks/674a26a7-281f62fc35910e3d.js","static/chunks/590-6eceeea46e07a9bb.js","static/chunks/840-483bf984fc909c66.js","static/chunks/957-37e9cd7439e9d1bb.js","static/chunks/460-47d0090d614ae740.js","static/chunks/ebc70433-8cecfd2e8969caca.js","static/css/04355bc28419f056.css","static/chunks/226-41318e02b45ee353.js","static/chunks/cfaebb58-274e29574afcd284.js"),self.__BUILD_MANIFEST_CB&&self.__BUILD_MANIFEST_CB();