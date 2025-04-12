export const generateClubManagerRequestEmail = (djName: string, clubName: string, message: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #000;
      color: #fff;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background: #f9f9f9;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 0.8em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Neue Anfrage von einem Club-Manager</h1>
    </div>
    <div class="content">
      <p>Hallo ${djName},</p>
      <p>Du hast eine neue Anfrage von ${clubName}:</p>
      <p>${message}</p>
      <p>Bitte antworte zeitnah auf diese Anfrage.</p>
    </div>
    <div class="footer">
      <p>Diese E-Mail wurde automatisch von der DJWG Platform gesendet.</p>
    </div>
  </div>
</body>
</html>
`;

export const generateClubManagerResponseEmail = (
  clubManagerName: string, 
  djName: string, 
  accepted: boolean,
  message?: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #000;
      color: #fff;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background: #f9f9f9;
    }
    .status {
      font-weight: bold;
      color: ${accepted ? '#22c55e' : '#ef4444'};
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 0.8em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Antwort auf deine DJ-Anfrage</h1>
    </div>
    <div class="content">
      <p>Hallo ${clubManagerName},</p>
      <p>
        ${djName} hat auf deine Anfrage geantwortet und diese 
        <span class="status">${accepted ? 'angenommen' : 'abgelehnt'}</span>.
      </p>
      ${message ? `<p>Nachricht: ${message}</p>` : ''}
    </div>
    <div class="footer">
      <p>Diese E-Mail wurde automatisch von der DJWG Platform gesendet.</p>
    </div>
  </div>
</body>
</html>
`;