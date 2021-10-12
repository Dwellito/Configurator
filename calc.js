function isProd() {
    return document.location.host === "www.dwellito.com"
}

const backendUrl = isProd() ? "https://dwellito.co" : "https://test.dwellito.co"

const getModelName = thePath => thePath.substring(thePath.lastIndexOf('/') + 1)

function currencyToNumber (str) {
    const num = Number(str.replace(/[^0-9\.-]+/g,""))
    return isNaN(num) ? -1 : num
}

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

    const amount = document.getElementById("Amount").value || document.getElementById("Amount").placeholder
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
    const responseJson = await response.json()
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("Complete-Submission").addEventListener("click", submitCalc)
}, false);