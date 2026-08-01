<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="DisciScan API — backend for the QR-based disciplinary records and monitoring system.">
    <title>DisciScan API</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cpath d='M20 2L5 10v10c0 8.25 6.75 15.75 15 18 8.25-2.25 15-9.75 15-18V10L20 2z' fill='%23151A21' stroke='%23F5A623' stroke-width='1.5'/%3E%3Cpath d='M16 21l3 3 6-7' stroke='%232ECC71' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            min-height: 100vh;
            background: #0D1117;
            background-image: radial-gradient(rgba(245, 166, 35, 0.07) 1px, transparent 1px);
            background-size: 26px 26px;
            color: #E6EDF3;
            font-family: 'JetBrains Mono', ui-monospace, monospace;
            display: flex;
            flex-direction: column;
        }

        .container {
            width: 100%;
            max-width: 960px;
            margin: 0 auto;
            padding: 0 24px;
        }

        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 28px 0;
            border-bottom: 1px solid rgba(230, 237, 243, 0.1);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 700;
            font-size: 18px;
            letter-spacing: 2px;
        }

        .brand .disci { color: #F5A623; }
        .brand .scan { color: #2ECC71; }

        .chip {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1.5px;
            color: #F5A623;
            border: 1px solid rgba(245, 166, 35, 0.45);
            border-radius: 999px;
            padding: 6px 14px;
            text-transform: uppercase;
        }

        main { flex: 1; }

        .hero {
            padding: 96px 0 64px;
            text-align: center;
        }

        .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #2ECC71;
            border: 1px solid rgba(46, 204, 113, 0.4);
            border-radius: 999px;
            padding: 6px 14px;
            margin-bottom: 40px;
        }

        .status .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #2ECC71;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.5); }
            50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(46, 204, 113, 0); }
        }

        .api-text {
            font-size: clamp(88px, 22vw, 200px);
            font-weight: 700;
            line-height: 0.95;
            letter-spacing: -6px;
            background: linear-gradient(180deg, #F5A623 0%, #B07416 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            user-select: none;
        }

        .subtitle {
            margin-top: 24px;
            font-size: 14px;
            color: #8B949E;
            letter-spacing: 0.5px;
        }

        .subtitle b { color: #E6EDF3; font-weight: 600; }

        .endpoints {
            max-width: 640px;
            margin: 64px auto 0;
            border: 1px solid rgba(230, 237, 243, 0.12);
            border-radius: 14px;
            background: rgba(13, 17, 23, 0.85);
            overflow: hidden;
            text-align: left;
        }

        .endpoints .title {
            padding: 14px 20px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #8B949E;
            border-bottom: 1px solid rgba(230, 237, 243, 0.1);
        }

        .endpoint {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 12px 20px;
            font-size: 13px;
            border-bottom: 1px solid rgba(230, 237, 243, 0.06);
        }

        .endpoint:last-child { border-bottom: none; }

        .method {
            min-width: 52px;
            text-align: center;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            border-radius: 6px;
            padding: 4px 0;
        }

        .method.post { color: #F5A623; background: rgba(245, 166, 35, 0.12); }
        .method.get { color: #2ECC71; background: rgba(46, 204, 113, 0.12); }
        .method.put { color: #58A6FF; background: rgba(88, 166, 255, 0.12); }
        .method.delete { color: #F85149; background: rgba(248, 81, 73, 0.12); }

        .endpoint .path { color: #E6EDF3; }
        .endpoint .desc { margin-left: auto; font-size: 11px; color: #8B949E; }

        footer {
            padding: 28px 0 36px;
            border-top: 1px solid rgba(230, 237, 243, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: #8B949E;
            letter-spacing: 0.5px;
        }

        footer .dot { color: #F5A623; }

        @media (max-width: 640px) {
            .hero { padding: 64px 0 40px; }
            .endpoint .desc { display: none; }
            footer { flex-direction: column; gap: 8px; text-align: center; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="brand">
                <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2L5 10v10c0 8.25 6.75 15.75 15 18 8.25-2.25 15-9.75 15-18V10L20 2z" fill="#151A21" stroke="#F5A623" stroke-width="1.5"/>
                    <path d="M20 5.5L8 12v8.5c0 6.75 5.25 12.75 12 14.5 6.75-1.75 12-7.75 12-14.5V12L20 5.5z" fill="#0D1117" stroke="#F5A623" stroke-width="0.75" opacity="0.5"/>
                    <path d="M16 21l3 3 6-7" stroke="#2ECC71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span><span class="disci">DISCI</span><span class="scan">SCAN</span></span>
            </div>
            <span class="chip">REST API</span>
        </header>

        <main>
            <section class="hero">
                <div class="status"><span class="dot"></span> Operational</div>
                <div class="api-text">API</div>
                <p class="subtitle">REST API for <b>DisciScan</b> — QR-based disciplinary records &amp; monitoring system</p>

                <div class="endpoints">
                    <div class="title">Endpoints</div>
                    <div class="endpoint">
                        <span class="method post">POST</span>
                        <span class="path">/api/login</span>
                        <span class="desc">authenticate</span>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span class="path">/api/me</span>
                        <span class="desc">current user</span>
                    </div>
                    <div class="endpoint">
                        <span class="method post">POST</span>
                        <span class="path">/api/logout</span>
                        <span class="desc">revoke token</span>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span class="path">/api/admin/users</span>
                        <span class="desc">manage users</span>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <span class="path">/api/admin/violation-types</span>
                        <span class="desc">manage violations</span>
                    </div>
                </div>
            </section>
        </main>

        <footer>
            <span>DisciScan <span class="dot">•</span> QR Disciplinary Records System</span>
            <span>Powered by Laravel {{ Illuminate\Foundation\Application::VERSION }}</span>
        </footer>
    </div>
</body>
</html>
