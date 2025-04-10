<!DOCTYPE html>
<html lang="en">
<head>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="icon" type="image/x-icon" href="/assets/images/logos/logo_sabedoria2.jpg">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">

<meta name="csrf-token" content="{{ csrf_token() }}">


    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Soberano</title>
    @viteReactRefresh
    @vite(['resources/js/index.jsx'])
</head>
<body>
    <div id="app"></div> <!-- Certifique-se de que este ID é 'app' -->
</body>
</html>
