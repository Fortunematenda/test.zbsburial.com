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
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\User;
use App\Models\CreditsTrailModel;


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
    Route::get('/profile/chat/{expertId}', [ProfileController::class, 'showChat'])->name('profile.chat.show');
    
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

// Mobile payment redirect routes (public - no auth required, accessed by Stripe)
Route::get('/mobile/purchase/success', function (Request $request) {
    try {
        $sessionId = $request->query('session_id');
        
        if (!$sessionId) {
            $html = '<!DOCTYPE html>
<html>
<head>
    <title>Payment Error</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2>Session ID is required</h2>
        <p style="margin-top: 30px;">Redirecting back to app...</p>
    </div>
    <script>
        window.location.href = "fortai://purchase/failed";
        setTimeout(function() {
            document.body.innerHTML = "<div style=\"text-align: center; padding: 50px; font-family: Arial, sans-serif;\"><h2>Session ID is required</h2><p>Please open the Fortai app.</p></div>";
        }, 2000);
    </script>
</body>
</html>';
            return response($html)->header('Content-Type', 'text/html');
        }

        Stripe::setApiKey(config('services.stripe.secret'));
        $checkout_session = Session::retrieve($sessionId);

        if ($checkout_session->payment_status === 'paid') {
            \Log::info('Stripe session retrieved', [
                'session_id' => $sessionId,
                'payment_status' => $checkout_session->payment_status,
                'metadata' => $checkout_session->metadata ? (array) $checkout_session->metadata : null
            ]);

            if (!$checkout_session->metadata || !isset($checkout_session->metadata->user_id)) {
                \Log::error('Missing metadata in checkout session', [
                    'session_id' => $sessionId,
                    'has_metadata' => !is_null($checkout_session->metadata)
                ]);
                
                $html = '<!DOCTYPE html>
<html>
<head>
    <title>Payment Error</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2 style="color: orange;">Payment Successful but Processing Error</h2>
        <p style="margin-top: 30px;">Please contact support with session ID: ' . htmlspecialchars($sessionId) . '</p>
        <p>Redirecting back to app...</p>
    </div>
    <script>
        window.location.href = "fortai://purchase/failed";
        setTimeout(function() {
            document.body.innerHTML = "<div style=\"text-align: center; padding: 50px; font-family: Arial, sans-serif;\"><h2 style=\"color: orange;\">Please contact support</h2><p>Session ID: ' . htmlspecialchars($sessionId) . '</p></div>";
        }, 3000);
    </script>
</body>
</html>';
                return response($html)->header('Content-Type', 'text/html');
            }

            $userId = (int) $checkout_session->metadata->user_id;
            $credits = (int) ($checkout_session->metadata->credits ?? 0);

            if ($credits <= 0) {
                \Log::error('Invalid credits value in metadata', [
                    'session_id' => $sessionId,
                    'credits' => $checkout_session->metadata->credits
                ]);
            }

            $user = User::find($userId);
            if (!$user) {
                \Log::error('User not found for payment', [
                    'session_id' => $sessionId,
                    'user_id' => $userId
                ]);
                
                $html = '<!DOCTYPE html>
<html>
<head>
    <title>Payment Error</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2 style="color: red;">User Account Not Found</h2>
        <p style="margin-top: 30px;">Please contact support.</p>
        <p>Redirecting back to app...</p>
    </div>
    <script>
        window.location.href = "fortai://purchase/failed";
        setTimeout(function() {
            document.body.innerHTML = "<div style=\"text-align: center; padding: 50px; font-family: Arial, sans-serif;\"><h2 style=\"color: red;\">Please contact support</h2></div>";
        }, 3000);
    </script>
</body>
</html>';
                return response($html)->header('Content-Type', 'text/html');
            }

            $oldBalance = $user->credits_balance;
            $user->credits_balance = ($user->credits_balance ?? 0) + $credits;
            $user->save();

            \Log::info('Credits updated successfully', [
                'user_id' => $user->id,
                'old_balance' => $oldBalance,
                'credits_added' => $credits,
                'new_balance' => $user->credits_balance
            ]);

            CreditsTrailModel::create([
                'user_id' => $user->id,
                'lead_id' => 0,
                'credits' => $credits,
                'entered_by' => $user->id,
                'transaction_type' => 'Purchase',
                'date_entered' => now(),
            ]);

            $html = '<!DOCTYPE html>
<html>
<head>
    <title>Payment Successful</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2 style="color: green;">Payment Successful!</h2>
        <p style="font-size: 18px;">' . $credits . ' credits have been added to your account.</p>
        <p style="margin-top: 30px;">Redirecting back to app...</p>
    </div>
    <script>
        window.location.href = "fortai://purchase/success?credits=' . $credits . '";
        setTimeout(function() {
            document.body.innerHTML = "<div style=\"text-align: center; padding: 50px; font-family: Arial, sans-serif;\"><h2 style=\"color: green;\">Payment Successful!</h2><p style=\"font-size: 18px;\">' . $credits . ' credits have been added to your account.</p><p>Please open the Fortai app to see your updated credits.</p></div>";
        }, 2000);
    </script>
</body>
</html>';
            return response($html)->header('Content-Type', 'text/html');
        }

        $html = '<!DOCTYPE html>
<html>
<head>
    <title>Payment Failed</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2 style="color: red;">Payment Not Completed</h2>
        <p style="margin-top: 30px;">Redirecting back to app...</p>
    </div>
    <script>
        window.location.href = "fortai://purchase/failed";
        setTimeout(function() {
            document.body.innerHTML = "<div style=\"text-align: center; padding: 50px; font-family: Arial, sans-serif;\"><h2 style=\"color: red;\">Payment Not Completed</h2><p>Please open the Fortai app to try again.</p></div>";
        }, 2000);
    </script>
</body>
</html>';
        return response($html)->header('Content-Type', 'text/html');
    } catch (\Throwable $e) {
        \Log::error('Payment success handler error: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        
        $html = '<!DOCTYPE html>
<html>
<head>
    <title>Payment Error</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2 style="color: red;">Payment Processing Error</h2>
        <p style="margin-top: 30px;">Redirecting back to app...</p>
    </div>
    <script>
        window.location.href = "fortai://purchase/failed";
        setTimeout(function() {
            document.body.innerHTML = "<div style=\"text-align: center; padding: 50px; font-family: Arial, sans-serif;\"><h2 style=\"color: red;\">Payment Processing Error</h2><p>Please open the Fortai app and contact support if the issue persists.</p></div>";
        }, 2000);
    </script>
</body>
</html>';
        return response($html)->header('Content-Type', 'text/html');
    }
});

Route::get('/mobile/purchase/cancelled', function (Request $request) {
    $html = '<!DOCTYPE html>
<html>
<head>
    <title>Payment Cancelled</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2>Payment Cancelled</h2>
        <p style="margin-top: 30px;">Redirecting back to app...</p>
    </div>
    <script>
        window.location.href = "fortai://purchase/cancelled";
        setTimeout(function() {
            document.body.innerHTML = "<div style=\"text-align: center; padding: 50px; font-family: Arial, sans-serif;\"><h2>Payment Cancelled</h2><p>Please open the Fortai app.</p></div>";
        }, 2000);
    </script>
</body>
</html>';
    return response($html)->header('Content-Type', 'text/html');
});

// Load authentication routes
require __DIR__.'/auth.php';
