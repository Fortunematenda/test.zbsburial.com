<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\StripeProductsModel;
use App\Models\CreditsTrailModel;

class PurchaseController extends Controller
{
    public function purchase(Request $request)
    {
        $product_id = (int)$request->product_id;
        // Set Stripe API key
        Stripe::setApiKey(config('services.stripe.secret'));

        // Get selected product details based on user choice
        $productDetails = StripeProductsModel::where('id','=',$product_id)->first();
        session(['productDetails' => $productDetails]);
        // Create Stripe Checkout session
        $checkout_session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'zar',
                    'product_data' => [
                        'name' => $productDetails['name'],
                    ],
                    'unit_amount' => $productDetails['price'] * 100, // Stripe expects amount in cents
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => route('purchase.success'),
            'cancel_url' => route('purchase.cancel'),
        ]);

        // Redirect to Stripe Checkout
        return redirect($checkout_session->url);
    }

    public function successPurchase(Request $request)
    {
        $user = $request->user();
        $productDetails = session('productDetails');
        $credits = (int)$productDetails->credits;
        // Handle null credits_balance for new users
        $credits_balance = $user->credits_balance ?? 0;
        $balance = $credits_balance + $credits;
        $user->credits_balance = $balance;
        $user->save();
        $credits_arr = CreditsTrailModel::create(["user_id"=>$user->id,"lead_id"=>0,"credits"=>$credits,"entered_by"=>$user->id,"transaction_type"=>"Purchase"]);
             
        return view('leads.success-purchase',compact(["credits"]));

    }
    public function failedPurchase(Request $request)
    {
        return view('leads.failed-purchase');
    }
}
