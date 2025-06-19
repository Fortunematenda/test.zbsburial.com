<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LeadsController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CreditController; 
use App\Http\Controllers\PurchaseController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\HelpController;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\PasswordController;


// Home route
//Route::get('/', [CustomerController::class, 'createRequest'])->name('createrequests');
Route::get('/', function (Request $request) {
    if (Auth::check()) {
        $user = Auth::user();

        if ($user->role === 'Expert') {
            return app(ProfileController::class)->openDashboard($request);
        } elseif ($user->role === 'Customer') {
            return app(CustomerController::class)->customerdashboard($request);
        } else {
            return app(CustomerController::class)->customerdashboard($request);
        }
    }

    return app(CustomerController::class)->createRequest();
})->name('createrequests');


// Dashboard route with middleware for authenticated users
Route::get('/dashboard', [ProfileController::class, 'openDashboard'])->middleware(['auth:sanctum', 'verified'])->name('dashboard');
Route::get('/test', [CustomerController::class, 'mTest'])->name('test');

Route::get('/customer/createrequests', [CustomerController::class, 'createRequest'])->name('createrequests');
Route::post('/getservices', [LeadsController::class, 'getServices'])->name('getservices');
Route::post('/getservicesquestions', [CustomerController::class, 'getServicesQuestions'])->name('getservicesquestions');
// Group routes for authenticated users
Route::middleware('auth')->group(function () {   
   // Your routes that require both auth and the Expert role
   Route::get('/settings', [ProfileController::class, 'edit'])->name('profile.edit');
   Route::patch('/settings', [ProfileController::class, 'update'])->name('profile.update');
   Route::delete('/settings', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/help/submit', [HelpController::class, 'submit'])->name('help.submit');
    Route::get('change-password', [PasswordController::class, 'showChangePasswordForm'])
        ->name('password.change');

    Route::put('change-password', [PasswordController::class, 'updateWithoutOld'])
        ->name('password.updateold');
});

Route::middleware(['auth', \App\Http\Middleware\Roles::class . ':Expert'])->group(function () {
   
    Route::post('/settings', [ProfileController::class, 'notifications'])->name('profile.notifications');
});

// Group routes for guest users
Route::middleware('guest:sanctum')->group(function () {
    Route::get('/profession/create', [ProfileController::class, 'createProfession'])->name('createprofession');
    Route::get('/profession/create-account/{id}', [ProfileController::class, 'createAccountProfession'])->name('createaccountprofession');    
    Route::post('/registeruser', [RegisteredUserController::class, 'store'])->name('registeruser');    
    Route::get('/customer/create', [CustomerController::class, 'createCustomer'])->name('create.customer');
    Route::get('/customer/requests', [CustomerController::class, 'showRequests'])->name('customer.requests');            
    Route::post('/customer/createlead', [CustomerController::class, 'createLead'])->name('createlead');
});

// Group routes for authenticated sellers/leads
Route::middleware('auth:sanctum')->group(function () {
    // Seller/Lead Routes    
    Route::get('/help', [LeadsController::class, 'showHelp'])->name('help');
    Route::post('/registerlogged', [RegisteredUserController::class, 'registerLogged'])->name('registerlogged');  
    
    // Profile and Lead Updates 
   
    Route::get('/customer/dashboard', [CustomerController::class, 'customerdashboard'])->name('customer.dashboard');   
    Route::get('/customer/expertview', [CustomerController::class, 'expertView'])->name('expertview');
    Route::get('/customer/settings', [CustomerController::class, 'customerSettings'])->name('customersettings');
    Route::post('/customer/expertreplies', [CustomerController::class, 'expertReplies'])->name('expertreplies');
    Route::post('/getleadnotes', [LeadsController::class, 'getLeadNotes'])->name('getleadnotes');
    Route::post('/updateestimate', [LeadsController::class, 'updateEstimate'])->name('updateestimate');
    Route::post('/poststatus', [LeadsController::class, 'postStatus'])->name('poststatus');
    Route::get('/leadexperts', [LeadsController::class, 'leadExperts'])->name('leadexperts');
    Route::post('/addleadnote', [LeadsController::class, 'postNote'])->name('addleadnote');
    Route::post('/becomeexpert', [ProfileController::class, 'BecomeExpert'])->name('becomeexpert');
    Route::post('/posttoken', [ProfileController::class, 'postToken'])->name('posttoken');
    
});

Route::middleware(['auth:sanctum', \App\Http\Middleware\Roles::class . ':Expert'])->group(function () {
    Route::get('/seller/dashboard', [LeadsController::class, 'showLeads'])->name('show-leads');
    Route::get('/responses', [LeadsController::class, 'showResponses'])->name('show-responses');
    Route::post('/update_services', [ProfileController::class, 'updateServices'])->name('update_services');
    Route::post('/getleads', [LeadsController::class, 'getUserLeads'])->name('get_leads');
    Route::post('/getresponses', [LeadsController::class, 'getUserResponses'])->name('get_responses');
    Route::post('/leaddetails', [LeadsController::class, 'getLeadDetails'])->name('lead_details');
    Route::post('/getresponsedetails', [LeadsController::class, 'getResponseDetails'])->name('getresponsedetails');
    Route::post('/opencontacts', [LeadsController::class, 'openContacts'])->name('open_contacts');
    Route::post('/notinterested', [LeadsController::class, 'notInterested'])->name('not_interested');
    Route::get('/gotoemail/{id}', [LeadsController::class, 'goToEmail'])->name('gotoemail');
    Route::post('/send-email', [LeadsController::class, 'sendEmail'])->name('send.email');
    Route::post('/addleadstrail', [LeadsController::class, 'addLeadsTrail'])->name('addleadstrail');    
    Route::post('/updatestatus', [LeadsController::class, 'updateStatus'])->name('updatestatus');
    Route::post('/purchase', [PurchaseController::class,'purchase'])->name('purchase');
    Route::get('/purchase/success', [PurchaseController::class, 'successPurchase'])->name('purchase.success');
    Route::get('/purchase/cancel', [PurchaseController::class, 'failedPurchase'])->name('purchase.cancel');   
    Route::post('/notifications/update', [ProfileController::class, 'updateNotifications'])->name('notifications.update');
    Route::post('/notifications/update', [ProfileController::class, 'subscribedNotifications'])->name('notifications.subscribed');
    Route::post('/buy-credits', [CreditController::class, 'buyCredits']);
    Route::get('/buy-credits', [CreditController::class, 'showBuyCreditsPage'])->name('credits.buy');
    Route::get('/credit/{userId}/credit-history', [CreditController::class, 'getCreditHistory'])->name('credit.history');
    Route::get('/credit/packages', [CreditController::class, 'showPackages'])->name('credit.packages');
    Route::get('/credit-packages', [CreditController::class, 'showCreditPackages'])->name('credit.packages');
    Route::get('/transaction-history', [ProfileController::class, 'transactionHistory'])->name('transaction.history');
    Route::get('/getleadstrend', [ProfileController::class, 'leadsTrend'])->name('getleadstrend');
    Route::post('/social/update', [ProfileController::class, 'updateSocialLinks'])->name('update.sociallinks');
    Route::post('/upload_photos', [ProfileController::class, 'uploadPhotos'])->name('upload_photos');
    Route::post('/deletephoto', [ProfileController::class, 'deletePhoto'])->name('deletephoto');
    Route::post('/postrating', [CustomerController::class, 'insertRatings'])->name('postrating');
    Route::post('/verifyfica', [ProfileController::class, 'VerifyFica'])->name('verifyfica');
});

// Load authentication routes
require __DIR__.'/auth.php';
