// Replace with your own publishable key: https://dashboard.stripe.com/test/apikeys
var PUBLISHABLE_KEY = 'pk_test_51HoeyEFEZhRaTFJzSPYVszW1PKEZUfFL6jwEjjsoya2ZlGAi6rmBRlDcP4eUZ3761XawDVollCX60y9nP6AiPgNh00hehVLUVE';
// Replace with the domain you want your users to be redirected back to after payment
var DOMAIN = location.href.replace(/[^/]*$/, '');

if (PUBLISHABLE_KEY === 'pk_test_Tr8olTkdFnnJVywwhNPHwnHK00HkHV4tnP') {
    console.log(
        'Replace the hardcoded publishable key with your own publishable key: https://dashboard.stripe.com/test/apikeys'
    );
}

var stripe = Stripe(PUBLISHABLE_KEY);

var donationProductMap = {};
donationProductMap[1] = "price_1HpPPMFEZhRaTFJzFU4iNYkr";
donationProductMap[5] = "price_1HpPPMFEZhRaTFJzC31ZSDq5";
donationProductMap[10] = "price_1HpPPMFEZhRaTFJzfdOIQ5vn";
donationProductMap[15] = "price_1HpPPMFEZhRaTFJzM7tRzI3H";
donationProductMap[20] = "price_1HpPPMFEZhRaTFJzyZNgQI5S";
donationProductMap[25] = "price_1HpPPNFEZhRaTFJzg4V8UOoN";
donationProductMap[50] = "price_1HpPPMFEZhRaTFJzWsAKqhZ4";
donationProductMap[100] = "price_1HpPPMFEZhRaTFJzim2uArEF";

// Handle any errors from Checkout
var handleResult = function (result) {
    if (result.error) {
        let displayError = document.getElementById('error-message');
        displayError.textContent = result.error.message;
    }
};

document.querySelectorAll('button.preset').forEach(function (button) {
    button.addEventListener('click', function (e) {
        let mode = e.target.dataset.checkoutMode;
        let priceId = e.target.dataset.priceId;
        let items = [{ price: priceId, quantity: 1 }];

        // Make the call to Stripe.js to redirect to the checkout page
        // with the sku or plan ID.
        stripe
            .redirectToCheckout({
                mode: mode,
                billingAddressCollection: 'required',
                lineItems: items,
                successUrl:
                    DOMAIN + 'success.html?session_id={CHECKOUT_SESSION_ID}',
                cancelUrl:
                    DOMAIN + 'canceled.html?session_id={CHECKOUT_SESSION_ID}',
            })
            .then(handleResult);
    });
});

function findSplitOfCustomDonation(donationAmount, availableAmounts) {
    let availability = availableAmounts.length - 1;
    let tempDonation = donationAmount;
    let count = 0;
    let amountsProcessed = [];

    if (donationAmount <= 0) {
        return amountsProcessed;
    }

    while (availability >= 0) {
        if (tempDonation - availableAmounts[availability] >= 0) {
            tempDonation -= availableAmounts[availability];
            count++;
            amountsProcessed.push(availableAmounts[availability])
        } else {
            availability--;
        }
    }

    return amountsProcessed;
}

function processCustomDonation() {
    const AVAILABLE_AMOUNTS = [1, 5, 10, 15, 20, 25, 50, 100];
    let customDonationAmount = document.getElementById("customAmount").value;
    let splitValue = findSplitOfCustomDonation(customDonationAmount, AVAILABLE_AMOUNTS);
    let occurences = Object.fromEntries([...splitValue.reduce((map, key) => map.set(key, (map.get(key) || 0) + 1), new Map())]);
    let lineItems = [];
    console.log(occurences);
    Object.keys(occurences).forEach((key) => {
        if (key in donationProductMap) {
            let productId = donationProductMap[key];
            let value = occurences[key];
            let lineItemObject = { price: productId, quantity: value};
            lineItems.push(lineItemObject);
        }
    });
    console.log(lineItems);
    if (lineItems.length > 0) {
        // Proceed to checkout with the necessary items in the checkout for donation.
        let mode = "payment";
        stripe
            .redirectToCheckout({
                mode: mode,
                billingAddressCollection: 'required',
                lineItems: lineItems,
                successUrl:
                    DOMAIN + 'success.html?session_id={CHECKOUT_SESSION_ID}',
                cancelUrl:
                    DOMAIN + 'canceled.html?session_id={CHECKOUT_SESSION_ID}',
            })
            .then(handleResult);
    }
}