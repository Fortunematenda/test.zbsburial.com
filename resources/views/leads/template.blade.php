<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background-color: #007bff;
            color: #fff;
            padding: 10px;
            text-align: center;
            font-size: 20px;
            border-radius: 8px 8px 0 0;
        }
        .email-body {
            padding: 20px;
            line-height: 1.6;
        }
        .email-footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #666;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            New Message
        </div>
        <div class="email-body">
            {!! nl2br(e($content)) !!}
        </div>
        <div class="email-footer">
            &copy; {{ date('Y') }} Rachfort Solutions. All rights reserved.
        </div>
    </div>
</body>
</html>
