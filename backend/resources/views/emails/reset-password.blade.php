<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>Reset your DisciScan password</title>
</head>
<body style="margin:0;padding:0;background-color:#0D1117;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D1117;">
        <tr>
            <td align="center" style="padding:36px 16px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

                    {{-- Header --}}
                    <tr>
                        <td style="padding:0 4px 18px;">
                            <span style="font-family:'JetBrains Mono',Menlo,Consolas,'Courier New',monospace;font-weight:700;font-size:16px;letter-spacing:3px;color:#E6E6E6;">DISCI<span style="color:#F5A623;">SCAN</span></span>
                            <span style="font-family:'JetBrains Mono',Menlo,Consolas,'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#8B949E;">&nbsp;&nbsp;PASSWORD RECOVERY</span>
                        </td>
                    </tr>

                    {{-- Card --}}
                    <tr>
                        <td style="background-color:#151A21;border:1px solid #21262D;border-radius:12px;">

                            {{-- Status strip --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #21262D;">
                                <tr>
                                    <td style="padding:12px 24px;font-family:'JetBrains Mono',Menlo,Consolas,'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#8B949E;">
                                        <span style="color:#2ECC71;font-size:11px;">&#9679;</span>&nbsp; SECURE CHANNEL
                                    </td>
                                    <td align="right" style="padding:12px 24px;font-family:'JetBrains Mono',Menlo,Consolas,'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#F5A623;">
                                        AUTH REQUIRED
                                    </td>
                                </tr>
                            </table>

                            {{-- Body --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding:28px 24px 0;">
                                        <h1 style="margin:0;font-family:'JetBrains Mono',Menlo,Consolas,'Courier New',monospace;font-size:18px;font-weight:700;color:#E6E6E6;letter-spacing:0.5px;">{{ $greeting }}</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 24px;font-family:Inter,Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#E6E6E6;">
                                        @foreach ($introLines as $line)
                                            <p style="margin:0 0 12px;">{{ $line }}</p>
                                        @endforeach
                                    </td>
                                </tr>

                                {{-- Action button --}}
                                <tr>
                                    <td align="center" style="padding:16px 24px 8px;">
                                        <a href="{{ $actionUrl }}" target="_blank" rel="noopener" style="display:inline-block;background-color:#F5A623;color:#000000;font-family:'JetBrains Mono',Menlo,Consolas,'Courier New',monospace;font-size:13px;font-weight:700;letter-spacing:1px;text-decoration:none;padding:14px 36px;border-radius:8px;">RESET PASSWORD &rarr;</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding:10px 24px 8px;font-family:'JetBrains Mono',Menlo,Consolas,'Courier New',monospace;font-size:10px;letter-spacing:1px;color:#8B949E;">
                                        or copy this link: <span style="color:#F5A623;word-break:break-all;">{{ $displayableActionUrl }}</span>
                                    </td>
                                </tr>

                                {{-- Security notice --}}
                                <tr>
                                    <td style="padding:16px 24px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D1117;border:1px solid #21262D;border-left:3px solid #F5A623;border-radius:8px;">
                                            <tr>
                                                <td style="padding:14px 18px;font-family:'JetBrains Mono',Menlo,Consolas,'Courier New',monospace;font-size:11px;line-height:1.9;color:#8B949E;">
                                                    <span style="color:#F5A623;font-weight:700;">// SECURITY NOTICE</span><br>
                                                    This link is <span style="color:#E6E6E6;">single-use</span> and expires in <span style="color:#E6E6E6;">60 minutes</span>.<br>
                                                    If you did not request this, <span style="color:#E6E6E6;">ignore this email</span> &mdash; your password will not change.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                {{-- Card footer --}}
                                <tr>
                                    <td style="padding:0 24px 24px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #21262D;">
                                            <tr>
                                                <td style="padding-top:18px;font-family:'JetBrains Mono',Menlo,Consolas,'Courier New',monospace;font-size:10px;line-height:1.9;color:#8B949E;">
                                                    {{ $salutation }}<br>
                                                    DisciScan &mdash; QR-based disciplinary records and monitoring system
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td align="center" style="padding:24px 12px 0;font-family:'JetBrains Mono',Menlo,Consolas,'Courier New',monospace;font-size:10px;letter-spacing:1px;line-height:1.9;color:#5B7A99;">
                            This is an automated message from DisciScan. Do not reply to this email.<br>
                            &copy; {{ date('Y') }} DisciScan &mdash; every session is logged.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
