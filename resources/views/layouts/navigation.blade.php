
<nav class="navbar sticky-top navbar-expand-lg bark-header  body-min-width header-shadow background-color-white bg-white border-b border-gray-100" x-data="{ open: false }" id="bark-header">
@guest
<a class="navbar-brand py-3" href="/">
            <img class="img-fluid loaded" src="{{asset('build/assets/img/fortailogo.png')}}" width="80" height="24" title="Fortai Logo" alt="Fortai Logo" data-was-processed="true">
        </a>
@endguest  
@auth
       


@if(session('temp_role') == "Expert") 
<a class="navbar-brand py-3" href="/dashboard/">
            <img class="img-fluid loaded" src="{{asset('build/assets/img/fortailogo.png')}}" width="80" height="24" title="Fortai Logo" alt="Fortai Logo" data-was-processed="true">
        </a>
   
        @else
        <a class="navbar-brand py-3" href="/customer/dashboard/">
            <img class="img-fluid loaded" src="{{asset('build/assets/img/fortailogo.png')}}" width="80" height="24" title="Fortai Logo" alt="Fortai Logo" data-was-processed="true">
        </a>
       <!-- Primary Navigation Menu -->
@endif


@endauth
@auth
        <div class="collapsed ml-auto d-flex d-lg-none notifications-dropdown">
            <a class="notifications-dropdown-toggle" href="#" id="" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <div class="ld-notifications-cont">
                   <!-- <span class="seller-notification notification-bell mobile-notifications-trigger" style="">
                        <img src="{{asset('build/assets/img/bell-default.png!d=2M4f26')}}" alt="" width="24" height="24">
                        <span class="red-circle"></span>
                    </span>-->
                </div>
            </a>
          
        </div>
        @endauth
        
       
    <div class="collapse navbar-collapse dixylo" id="navbarSupportedContent">
    @auth
    <ul class="navbar-nav ml-auto d-flex align-items-center">
    @if(session('temp_role') == "Expert")
    @if(empty(auth()->user()->id_upload) || empty(auth()->user()->date_verified))
    @else
    <li class="dashboard-home nav-item px-2 py-3 py-sm-4" id="js-joyride-dashboard-home">
        <a class="text-grey-400 nav-link py-0" href="/dashboard/">Dashboard</a>
    </li>
    <li class="requests nav-item px-2 py-3 py-sm-4 active" id="js-joyride-requests">
        <a class="text-grey-400 nav-link py-0" href="/seller/dashboard/">Leads</a>
    </li>
    <li class="my-responses nav-item px-2 py-3 py-sm-4" id="js-joyride-my-responses">
        <a class="text-grey-400 nav-link py-0" href="/responses"">My Responses</a>
    </li>
    @endif
    @else
    <li class="requests nav-item px-2 py-3 py-sm-4 active" id="js-joyride-requests">
            <a class="text-grey-400 nav-link py-0" href="/customer/dashboard/">My Requests</a>
        </li> 
@endif
    <li class="nav-item dropdown notifications-dropdown py-2 d-none d-lg-block">
        <a class="notifications-dropdown-toggle" href="/seller/dashboard" id="" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <div class="ld-notifications-cont">
                <span class="seller-notification notification-bell mobile-notifications-trigger" style="display:none;">
                    <img src="{{asset('build/assets/img/bell-default.png!d=2M4f26')}}" alt="" width="24" height="24" class="loading" data-was-processed="true">
                    <span class="red-circle"></span>
                </span>
            </div>
        </a>
        <div class="dropdown-menu dropdown-menu-right notification-dropdown-box" aria-labelledby="notifications-dropdown-toggle">
            <ul id="seller-notifications" class="dropdown notification-list js-notification-list"></ul>
        </div>
    </li>
</li>
<li class="nav-item dropdown user-account-dropdown seller p-lg-2">
    <a class="d-lg-flex flex-row" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <x-dropdown align="right" width="48">
            <x-slot name="trigger">
            <div class="d-inline-flex text-white justify-content-center align-items-center">
                                                                    <div class="elite-pro d-inline-flex justify-content-center align-items-center">
                                        <span class="w-0"></span>
                                        <img class="img-fluid default-avatar default-avatar-36 elite-pro-border elite-pro-border-sm ml-3 mr-1 loading" 
    alt="Rachfort Solutions" width="32" height="32" title="Rachfort Solutions"  
    src="{{ isset($user) && $user->profile_picture && file_exists(public_path('storage/profile_pictures/' . $user->profile_picture)) 
            ? asset('storage/profile_pictures/' . $user->profile_picture) 
            : 'https://bootdey.com/img/Content/avatar/avatar1.png' }}" 
    data-was-processed="true">

                                        
                                        <div class="d-none default-avatar default-avatar-36 bg-heliotrope text-white ml-3 mr-1 justify-content-center align-items-center elite-pro-border elite-pro-border-sm">
                                            R
                                        </div>
                                       
                                    </div>
                    
                </a>

                                        

</x-slot>
<x-slot name="content" style="background-color: gray;" class="sc-1s8qip7-0 sc-hkhyta-2 ceTrJs dOiuFl">
 <div class="sc-1s8qip7-1 sc-hkhyta-11 eCavCD clCrzG">
            <div class="sc-1s8qip7-2 sc-hkhyta-0 fxLrOp">
            @auth
        {{ auth()->user()->first_name }} {{ auth()->user()->last_name }}
            @endauth
            </div>
            
        </div>
        @if(auth()->user()->role == "Expert")
        <div class="sc-1s8qip7-4 sc-hkhyta-12 gnCLxp hkYiXY">
                <div class="sc-1s8qip7-16 cwXCbP">
                    <div class="sc-1s8qip7-17 hVHmYO">
                    <img src="https://assets.fsbtech.com/react/icons/account-reward/supersport/reward.svg" class="sc-1s8qip7-15 dmysol">
                </div>
                <div class="sc-1s8qip7-5 sc-hkhyta-8 ctDvgK ">
                  Balance :
                </div>
                &nbsp;
                    
                </div>
                <div class="sc-1s8qip7-6 sc-hkhyta-9  ">
                    <span>
                    {{ auth()->user()->credits_balance }}
                    </span>
                  Credits
                </div>
            </div>
            @endif
            <div class="sc-1s8qip7-17 hVHmYO">
            
           
        </div>
        <div class="sc-1s8qip7-4 sc-hkhyta-12 gnCLxp fXvisv">
            <div class="sc-1s8qip7-16 cwXCbP">
            <div class="sc-1s8qip7-17 hVHmYO">
                   
                </div>
                <div class="sc-1s8qip7-5 sc-hkhyta-8 ctDvgK">
                <div class="verified-phone-container ml-3">
                    <div class="bg-grey-50 rounded-pill text-green cursor-pointer d-flex verified-phone-button">
                        <span class="fortai-svg-icon bsi-primary-primary bsi-primary-green">
                            <!--?xml version='1.0' encoding='UTF-8'?-->
                          <i class="bi bi-patch-check"></i>
                        </span>
                        Verified
                    </div>
                </div>
                </div>
            </div>
                &nbsp;
                    
                <div class="sc-1s8qip7-6 sc-hkhyta-9 edgKuz">
            
                </div>
            </div>
            <div class="sc-1s8qip7-4 sc-hkhyta-12 gnCLxp hkYiXY">
                <div class="sc-1s8qip7-16 cwXCbP">
                    <div class="sc-1s8qip7-17 hVHmYO">
                    
                </div>
                
            </div>
           
        </div>
        


        
        <div class="sc-1s8qip7-11 sc-hkhyta-10 kpsRoH qQMnI">

        </div>
        <div class="sc-1s8qip7-13 sc-hkhyta-14 nWBeg igslBq">
        @if(auth()->user()->role == "Expert")
            <a aria-label="chatai" >
                <div class="sc-1s8qip7-18 cDRzHp">
                    
                    <div class="sc-1s8qip7-12 sc-hkhyta-6 cNLnak jHYwEm">
                    @if(session('temp_role') == "Expert")
                  <x-dropdown-link :href="route('customer.dashboard')">
                    {{ __('Switch to Customer') }}
                      </x-dropdown-link>
                      @else
                      <x-dropdown-link :href="route('dashboard')">
                    {{ __('Switch to Expert') }}
                      </x-dropdown-link>
                      @endif

                    </div>
                </div>
            </a>  
            <a aria-label="my-bets" >
                <div class="sc-1s8qip7-12 sc-hkhyta-6 cNLnak jHYwEm">
                    <x-dropdown-link :href="route('profile.edit')">
                        {{ __('Account Settings') }}
                    </x-dropdown-link>
                </div>
            </a>
@else
            <a aria-label="my-bets" >
                <div class="sc-1s8qip7-12 sc-hkhyta-6 cNLnak jHYwEm">
                    <x-dropdown-link :href="route('customersettings')">
                        {{ __('Account Settings') }}
                    </x-dropdown-link>
                </div>
            </a>
          @endif  
             <a aria-label="chatai" >
                <div class="sc-1s8qip7-18 cDRzHp">
                    
                    <div class="sc-1s8qip7-12 sc-hkhyta-6 cNLnak jHYwEm">
                  <x-dropdown-link :href="route('help')" >
                    {{ __('Help') }}
                      </x-dropdown-link>
                    </div>
                </div>
            </a>

            
           
            
            
   

        </div>
        
           <!-- Authentication -->

        <form method="POST" action="{{ route('logout') }}">
        @csrf
        
        <div class="sc-1s8qip7-14 sc-hkhyta-7 jvzCSS guzjrm   ">
            <div class="sc-1s8qip7-18 cDRzHp">
                <x-dropdown-link :href="route('logout')"
                onclick="event.preventDefault();
                            this.closest('form').submit();">
            {{ __('Log Out') }}
        </x-dropdown-link>
            </div>
        </div>
   

   </form>

</x-slot>
                    </x-dropdown>
                                            </a>
                                            </span>
                                                    
                                            
                </li>
            
        </ul>
        @endauth

        @guest
        <ul class="navbar-nav ml-auto d-flex align-items-center">
        <li class="requests nav-item px-2 py-3 py-sm-4 active" id="js-joyride-requests">
                    <a class="text-grey-400 nav-link py-0" href="/customer/createrequests/">Home</a>
                </li>
                            <li class="dashboard-home nav-item px-2 py-3 py-sm-4 " id="js-joyride-dashboard-home">
                    <a class="text-grey-400 nav-link py-0" href="http://127.0.0.1:8000/profession/create">Join As a Pro</a>
                </li>
                <li class="dashboard-home nav-item px-2 py-3 py-sm-4 " id="js-joyride-dashboard-home">
                    <a class="text-grey-400 nav-link py-0" href="/login">Login</a>
                </li>
                  
        @endguest
            </div>

          
 <!-- Hamburger -->
<!-- Hamburger: Hidden on md (medium screens and larger) -->
<div class="-me-2 flex items-center md:hidden">
    <button @click="open = ! open" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out">
        <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path :class="{'hidden': open, 'inline-flex': ! open }" class="inline-flex" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path :class="{'hidden': ! open, 'inline-flex': open }" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
</div>

<!-- Mobile Menu: Displayed when open -->
<div x-show="open" class=" top-0 left-0 w-full bg-white border-b border-gray-100 z-10 md:hidden" @click.away="open = false">
    <div class="pt-2 pb-3 px-2">
    
        <div class="mt-2 flex justify-center">
            <ul class="navbar-nav flex-col items-center w-full">
            @auth
                @if(session('temp_role') == "Expert")
                @if(empty(auth()->user()->id_upload) || empty(auth()->user()->date_verified))
                @else
                    <li class="nav-item text-grey-400 mb-2">
                        <a class="nav-link" href="/dashboard">Dashboard</a>
                    </li>
                    <li class="nav-item mb-2">
                        <a class="nav-link" href="/seller/dashboard/">Leads</a>
                    </li>
                    <li class="nav-item mb-2">
                        <a class="nav-link" href="/responses">My Responses</a>
                    </li>
@endif
                @else
                    <li class="nav-item mb-2">
                        <a class="nav-link" href="/customer/dashboard/">My Requests</a>
                    </li>
                    
                @endif
                <li class="nav-item mb-2">
                    @if(session('temp_role') == "Expert")
                        <a class="nav-link" href="{{ route('profile.edit') }}">Account Settings</a>
                    @else
                        <a class="nav-link" href="{{ route('customersettings') }}">Account Settings</a>
                    @endif
                </li>
                <li class="nav-item mb-2">
                    @if(session('temp_role') == "Expert")
                        <a class="nav-link" href="{{ route('customer.dashboard') }}">Switch To Customer</a>
                    @else
                        <a class="nav-link" href="{{ route('dashboard') }}">Switch to Expert</a>
                    @endif
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link" href="/help">Help</a>
                </li>
                @auth
                    <li class="nav-item mb-2">
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <a class="nav-link"
                               onclick="event.preventDefault(); this.closest('form').submit();">
                                {{ __('Log Out') }}
                            </a>
                        </form>
                    </li>
                @endauth
                @endauth
                @guest

                <li class="nav-item mb-2"><a class="nav-link" href="/login">Login</a></li>
                <li class="nav-item mb-2"><a class="nav-link" href="/customer/createrequests">Looking For Services</a></li>

@endguest
            </ul>
        </div>
    </div>
</div>


  
</nav>

<style>
.dOiuFl {
    width: 300px;
    padding: 0px;
}

.ceTrJs {
    width: 280px;
    min-height: 420px;
    max-height: calc(-64px + 100vh);
    overflow: auto;
    padding: 12px 16px;
    position: absolute;
    right: 24px;
    background-color: rgb(255, 255, 255);
    top: 64px;
    z-index: 1;
    border-radius: 4px;
    cursor: default;
    animation: 300ms ease 0s 1 normal none running react-responsive-modal-overlay-in;
}
.clCrzG {
    margin: 16px;
}

.eCavCD {
    display: flex
;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    align-items: center;
    margin-bottom: 16px;
}

.fxLrOp {
    color: hsl(318, 75.50%, 38.40%);
    font-size: 20px;
    font-weight: bold;
}
.bCqJic {
    color: hsl(318, 75.50%, 38.40%);
    font-size: 14px;
    font-weight: bold;
}
.fXvisv {
    margin: 12px 16px;
}

.gnCLxp {
    display: flex
;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    align-items: center;
    margin-bottom: 4px;
}
.cwXCbP {
    display: flex
;
}
.ctDvgK {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.87);
    margin-left: 4px;
}
.hVHmYO {
    display: flex
;
    -webkit-box-align: center;
    align-items: center;
}
.dmysol {
    height: 16px;
}
.hVHmYO {
    display: flex
;
    -webkit-box-align: center;
    align-items: center;
}
.topheader {
    background-color: #111fa3;
    display: flex
;
    flex-direction: row;
    font-size: 14px;
    height: 88px;
    width: 100%;
}
.edgKuz {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.87);
}
.hkYiXY {
    margin: 4px 16px;
}

.gnCLxp {
    display: flex
;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    align-items: center;
    margin-bottom: 4px;
}
.dYOyxF > a {
    display: block;
    text-align: center;
    padding: 8px 0px;
    width: 100%;
}
.knOKru {
    border-radius: 20px;
    height: 40px;
    color: rgba(0, 0, 0, 0.87);
    background-color: rgb(255, 255, 255);
    border-color: rgba(55, 62, 85, 0.1);
    text-transform: uppercase;
}

.jIbDI {
    margin-bottom: 8px;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid hsl(318, 75.50%, 38.40%);
    color:hsl(318, 75.50%, 38.40%);
    font-weight: bold;
    display: flex
;
    flex: 1 1 0%;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    padding: 8px 0px;
}
.bTDIzv {
    border-radius: 20px;
    height: 40px;
    color: rgba(0, 0, 0, 0.87);
    background-color: rgb(255, 255, 255);
    border-color: rgba(55, 62, 85, 0.1);
    text-transform: uppercase;
}

.fcPWta {
    margin-bottom: 8px;
    margin-right: 8px;
    border-radius: 4px;
    border: 1px solid  hsl(318, 75.50%, 38.40%);
    color: hsl(318, 75.50%, 38.40%);
    font-weight: bold;
    display: flex
;
    flex: 1 1 0%;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    padding: 8px 0px;
}
.KoFio {
    margin: 0px 16px;
}

.MPbvU {
    display: flex
;
}
.qQMnI {
    background-color: rgb(255, 255, 255);
    margin: 0px;
}

.kpsRoH {
    background-color: rgb(218, 228, 236);
    height: 1px;
    margin-top: 16px;
}
.igslBq {
    margin-bottom: 0px;
}

.nWBeg {
    margin-bottom: 16px;
}
a {
    color: inherit;
    text-decoration: none;
}
.cDRzHp {
    display: flex
;
}
.fLQGYh {
    display: none;
}
.jHYwEm {
    display: flex
;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    align-items: center;
    width: 100%;
    border-bottom: 1px solid rgb(237, 237, 237);
    padding: 16px;
    margin: 0px;
}

.cNLnak {
    color: rgba(0, 0, 0, 0.87);
    font-size: 16px;
    margin-top: 16px;
    cursor: pointer;
}
.w-48 {
    width: 18rem !important;

.cDRzHp {
    display: flex
;
}
.fLQGYh {
    display: none;
}
.qQMnI {
    background-color: rgb(255, 255, 255);
    margin: 0px;
}

.kpsRoH {
    background-color: rgb(218, 228, 236);
    height: 1px;
    margin-top: 16px;
}
.guzjrm {
    height: 40px;
    color: rgba(0, 0, 0, 0.87);
    background-color: rgb(255, 255, 255);
    border: 1px solid rgba(55, 62, 85, 0.1);
    border-radius: 20px;
    margin: 12px 16px 16px;
    text-transform: uppercase;
    font-weight: bold;
    display: flex
;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
}

.jvzCSS {
    margin-top: 16px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.87);
    cursor: pointer;
}
.navbar[class*=bg-] .navbar-nav>.nav-item>.nav-link {
    color: grey !important;
}
}
</style>