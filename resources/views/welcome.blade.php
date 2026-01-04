<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Fortai - Connect with Professionals</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Figtree', ui-sans-serif, system-ui, sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            .gradient-bg {
                background: linear-gradient(to bottom, #000000 0%, #200D42 34%, #4F21A1 65%, #A46EDB 82%);
                min-height: 100vh;
                position: relative;
                overflow: hidden;
            }
            .stars {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 900px;
                background-image: 
                    radial-gradient(2px 2px at 20% 30%, white, transparent),
                    radial-gradient(2px 2px at 60% 70%, white, transparent),
                    radial-gradient(1px 1px at 50% 50%, white, transparent),
                    radial-gradient(1px 1px at 80% 10%, white, transparent),
                    radial-gradient(2px 2px at 90% 60%, white, transparent),
                    radial-gradient(1px 1px at 33% 80%, white, transparent);
                background-size: 200% 200%;
                animation: sparkle 20s ease-in-out infinite;
                opacity: 0.3;
            }
            @keyframes sparkle {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(-50px, -50px); }
            }
            .orb {
                position: absolute;
                height: 375px;
                width: 750px;
                border-radius: 100%;
                background: radial-gradient(closest-side, #000 82%, #9560EB);
                border: 1px solid #B48CDE;
                left: 50%;
                transform: translateX(-50%);
                top: calc(100% - 96px);
            }
            @media (min-width: 640px) {
                .orb {
                    width: 1536px;
                    height: 768px;
                    top: calc(100% - 120px);
                }
            }
            @media (min-width: 1024px) {
                .orb {
                    width: 2400px;
                    height: 1200px;
                }
            }
            .container {
                position: relative;
                z-index: 10;
                max-width: 1280px;
                margin: 0 auto;
                padding: 2rem 1rem;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2rem 0;
                flex-wrap: wrap;
                gap: 1rem;
            }
            .logo-container {
                display: flex;
                justify-content: center;
                flex: 1;
            }
            .logo {
                height: 4rem;
                width: 4rem;
                border-radius: 25px;
            }
            .logo-gradient-wrapper {
                position: relative;
                cursor: pointer;
            }
            .logo-gradient-wrapper .max-w-12 {
                position: relative;
                max-width: 3rem;
            }
            .logo-gradient-wrapper .blur-md {
                position: absolute;
                width: 100%;
                top: 0.5rem;
                bottom: 0;
                border-radius: 0.5rem;
            }
            .nav {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            .nav-link {
                padding: 0.5rem 1rem;
                color: rgba(255, 255, 255, 0.9);
                text-decoration: none;
                border-radius: 0.5rem;
                transition: all 0.3s ease;
                font-size: 0.875rem;
                font-weight: 500;
            }
            .nav-link:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #FFFFFF;
            }
            .hero {
                text-align: center;
                padding: 4rem 0;
                max-width: 800px;
                margin: 0 auto;
            }
            .hero h1 {
                font-size: 3rem;
                font-weight: 700;
                color: #FFFFFF;
                margin-bottom: 1.5rem;
                line-height: 1.2;
            }
            @media (min-width: 768px) {
                .hero h1 {
                    font-size: 4rem;
                }
            }
            .hero p {
                font-size: 1.25rem;
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 2rem;
                line-height: 1.6;
            }
            .cta-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 2rem;
            }
            .btn {
                padding: 0.875rem 2rem;
                border-radius: 50px;
                font-weight: 600;
                text-decoration: none;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1rem;
            }
            .btn-primary {
                background: #FFFFFF;
                color: #333333;
            }
            .btn-primary:hover {
                background: rgba(255, 255, 255, 0.9);
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }
            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: #FFFFFF;
                backdrop-filter: blur(10px);
            }
            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.5);
            }
            .features {
                display: grid;
                grid-template-columns: 1fr;
                gap: 1.5rem;
                margin-top: 4rem;
            }
            @media (min-width: 768px) {
                .features {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            @media (min-width: 1024px) {
                .features {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
            .feature-card {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                padding: 2rem;
                backdrop-filter: blur(20px);
                transition: all 0.3s ease;
            }
            .feature-card:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            .feature-icon {
                width: 3rem;
                height: 3rem;
                background: rgba(139, 92, 246, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 1rem;
                font-size: 1.5rem;
                color: #8B5CF6;
            }
            .feature-card h3 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #FFFFFF;
                margin-bottom: 0.75rem;
            }
            .feature-card p {
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.6;
                font-size: 0.875rem;
            }
            .footer {
                text-align: center;
                padding: 4rem 0 2rem;
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.875rem;
            }
        </style>
    </head>
    <body>
        <div class="gradient-bg">
            <div class="stars"></div>
            <div class="orb"></div>
            
            <div class="container">
                <header class="header">
                    <div class="logo-container">
                        <div class="logo-gradient-wrapper">
                            <div class="max-w-12">
                                <div class="blur-md" style="background: linear-gradient(to right, #F87BFF, #FB92CF, #FFDD98, #C2F0B1, #2FD8FE); filter: blur(12px);"></div>
                                <a class="navbar-brand py-3" href="/" style="position: relative; z-index: 10; display: block;">
                                    <x-application-logo class="w-20 h-20 fill-current text-gray-500" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <nav class="nav">
                        @if (Route::has('login'))
                            @auth
                                <a href="{{ url('/dashboard') }}" class="nav-link">Dashboard</a>
                            @else
                                <a href="{{ route('login') }}" class="nav-link">Log in</a>
                                <a href="{{ route('createrequests') }}" class="nav-link">Looking for Service</a>
                                @if (Route::has('createprofession'))
                                    <a href="{{ route('createprofession') }}" class="nav-link">Join As Professional</a>
                                @endif
                            @endauth
                        @endif
                    </nav>
                </header>

                <main>
                    <div class="hero">
                        <h1>Welcome to Fortai</h1>
                        <p>Connect with skilled professionals and get the services you need, when you need them.</p>
                        <div class="cta-buttons">
                            @guest
                                <a href="{{ route('createrequests') }}" class="btn btn-primary">
                                    <i class="fas fa-search"></i>
                                    Find Services
                                </a>
                                @if (Route::has('createprofession'))
                                    <a href="{{ route('createprofession') }}" class="btn btn-secondary">
                                        <i class="fas fa-user-tie"></i>
                                        Join As Professional
                                    </a>
                                @endif
                            @else
                                <a href="{{ url('/dashboard') }}" class="btn btn-primary">
                                    <i class="fas fa-tachometer-alt"></i>
                                    Go to Dashboard
                                </a>
                            @endguest
                        </div>
                    </div>

                    <div class="features">
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-search"></i>
                            </div>
                            <h3>Find Services</h3>
                            <p>Discover skilled professionals ready to help with your projects. Browse through verified service providers in your area.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-user-tie"></i>
                            </div>
                            <h3>Join As Professional</h3>
                            <p>Showcase your skills and connect with clients. Build your professional profile and grow your business.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <h3>Secure & Reliable</h3>
                            <p>All transactions are secure and protected. We ensure a safe environment for both clients and professionals.</p>
                        </div>
                    </div>
                </main>

                <footer class="footer">
                    <p>&copy; {{ date('Y') }} Fortai. All rights reserved.</p>
                </footer>
            </div>
        </div>
    </body>
</html>
