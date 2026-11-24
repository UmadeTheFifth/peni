(async () => {
  const params = new URLSearchParams(location.search);
  const ref = params.get('reference') || params.get('trxref');
  const title = document.getElementById('resultHeading');
  const message = document.getElementById('resultMessage');
  const reference = document.getElementById('resultRef');
  const tag = document.getElementById('resultTag');
  const retry = document.getElementById('retryPayment');
  if (!ref || !/^PENI-[0-9a-f-]{36}$/.test(ref)) {
    title.textContent = 'NO VALID PAYMENT REFERENCE.';
    message.textContent = 'We could not identify a PENI payment to verify. If you made a payment, contact support with your transaction details.';
    retry.hidden = true;
    return;
  }
  reference.textContent = `REFERENCE: ${ref}`;
  async function checkPayment() {
    retry.disabled = true;
    retry.textContent = 'CHECKING...';
    tag.textContent = 'PAYMENT VERIFICATION';
    try {
      const response = await fetch(`/api/order-status?reference=${encodeURIComponent(ref)}`, {cache: 'no-store'});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment verification is unavailable.');
      if (data.status === 'paid') {
        tag.textContent = 'PAYMENT CONFIRMED';
        title.textContent = 'PAYMENT SUCCESSFUL.';
        message.textContent = 'Your PENI order is confirmed as paid. Keep your payment reference for your records.';
        PeniStore.clearCart();
        retry.hidden = true;
      } else if (data.status === 'failed') {
        tag.textContent = 'PAYMENT NOT COMPLETED';
        title.textContent = 'PAYMENT UNSUCCESSFUL.';
        message.textContent = 'The provider reports that this payment did not complete. Your bag is preserved. Return to the bag if you want to try a new checkout.';
        retry.hidden = false;
      } else if (data.status === 'unknown') {
        tag.textContent = 'ORDER NOT FOUND';
        title.textContent = 'ORDER NOT FOUND.';
        message.textContent = 'The payment reference does not match a PENI order. Contact support if funds were deducted.';
        retry.hidden = true;
      } else {
        tag.textContent = 'PAYMENT NOT YET CONFIRMED';
        title.textContent = 'PAYMENT PENDING.';
        message.textContent = 'We cannot verify a successful payment yet. If you paid, use Check payment again. Do not pay twice without first checking.';
        retry.hidden = false;
      }
    } catch (err) {
      tag.textContent = 'VERIFICATION UNAVAILABLE';
      title.textContent = 'STATUS UNKNOWN.';
      message.textContent = err.message + ' If funds were deducted, do not pay twice before checking with support.';
      retry.hidden = false;
    } finally {
      retry.disabled = false;
      retry.textContent = 'CHECK PAYMENT AGAIN ↻';
    }
  }
  retry.addEventListener('click', checkPayment);
  await checkPayment();
})();
