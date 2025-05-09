export function generateQRCode(reservationId, elementId = 'qrcode') {
    const qrCodeDiv = document.getElementById(elementId);
    qrCodeDiv.innerHTML = '';
    new QRCode(qrCodeDiv, {
      text: reservationId,
      width: 128,
      height: 128
    });
  }