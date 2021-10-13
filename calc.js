function isProd() {
    return document.location.host === "www.dwellito.com"
}

const backendUrl = isProd() ? "https://dwellito.co" : "https://test.dwellito.co"

const getModelName = thePath => thePath.substring(thePath.lastIndexOf('/') + 1)

function currencyToNumber (str) {
    const num = Number(str.replace(/[^0-9\.-]+/g,""))
    return isNaN(num) ? -1 : num
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

function updateMonthlyPayment() {
    const interestFour = 0.04 / 12
    const interestFive = 0.05 / 12
    const interestSix = 0.06 / 12
    const payments = 30 * 12 // 30 year term

    const amount = document.getElementById("Amount").value
    const principal = currencyToNumber(amount);

    const xFour = Math.pow(1 + interestFour, payments)
    const xFive = Math.pow(1 + interestFive, payments)
    const xSix = Math.pow(1 + interestSix, payments)

    const monthlyFour = (principal * xFour * interestFour) / (xFour - 1);
    const monthlyFive = (principal * xFive * interestFive) / (xFive - 1);
    const monthlySix = (principal * xSix * interestSix) / (xSix - 1);

    document.getElementById("20-down-price").innerHTML = formatter.format(monthlyFour) + "/mo"
    document.getElementById("10-down-price").innerHTML = formatter.format(monthlyFive) + "/mo"
    document.getElementById("no-down-price").innerHTML = formatter.format(monthlySix) + "/mo"

    return formatter.format(monthlyFour) + "/mo"
}
// Price of the unit, already in page
const amount = document.getElementById("unit-price").innerHTML

//Set loan model input amount
document.getElementById("Amount").value = "$" + amount
document.getElementById("Amount").addEventListener('input', updateMonthlyPayment)

// Prepopulate model and update "As low as xxxx/mo"
document.getElementById("monthly-estimate").innerHTML = updateMonthlyPayment()

async function submitCalc () {
    const fourAPR = document.getElementById("4 APR").checked
    const fiveAPR = document.getElementById("5 APR").checked
    const sixAPR = document.getElementById("6 APR").checked

    var monthly;
    var interestRate;
    var down;

    if (fourAPR) {
        monthly = "20-down-price"
        interestRate = 0.04
        down = 0.2
    } else if (fiveAPR) {
        monthly = "10-down-price"
        interestRate = 0.05
        down = 0.1
    } else {
        monthly = "no-down-price"
        interestRate = 0.06
        down = 0
    }

    const amount = document.getElementById("Amount").value
    const loanAmount = currencyToNumber(amount);

    const monthlyPaymentStr = document.getElementById(monthly).innerHTML
    const monthlyPayment = currencyToNumber(monthlyPaymentStr.substring(0, monthlyPaymentStr.length - 3))

    const dob = document.getElementById("Date-of-birth").value
    const creditScore = document.getElementById("Credit-score").value
    const householdIncome = currencyToNumber(document.getElementById("Household-Income").value)
    const debt = currencyToNumber(document.getElementById("Debt").value)

    const name = document.getElementById("Full-Name-2").value
    const phone = document.getElementById("Phone-Number-3").value
    const email = document.getElementById("Email-2").value
    const address = document.getElementById("Address-2").value
    const city = document.getElementById("City-2").value
    const state = document.getElementById("State-2").value
    const zip = document.getElementById("Zip-Code-2").value

    const response = await fetch(backendUrl + '/api/calc', {
        method : "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        mode: "cors",
        redirect: "error",
        body: JSON.stringify({
            "loan-amount": loanAmount,
            email: email,
            model: getModelName(window.location.pathname),
            name: name,
            address: address,
            city: city,
            zipcode: zip,
            state: state,
            phone: phone,
            "credit-score": creditScore, //string
            "household-income": householdIncome, //int
            "monthly-payment": monthlyPayment, //int
            "down-payment": down, //decimal
            "interest-rate": interestRate, //decimal
            term: 30, //int
            dob: dob, //string
            debt: debt //int
        })
    })
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("Complete-Submission").addEventListener("click", submitCalc)
}, false);