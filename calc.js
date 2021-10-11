function isProd() {
    return document.location.host === "www.dwellito.com"
}

const backendUrl = isProd() ? "https://dwellito.co" : "https://test.dwellito.co"

const getModelName = thePath => thePath.substring(thePath.lastIndexOf('/') + 1)

async function submitCalc () {
    //TODO: the rest of the fields
    // const city = document.getElementById('City').value.trim();

    if (true) { // no empty fields -> implies they're in the right spot in the flow to submit
        const response = await fetch(backendUrl + '/api/calc', {
            method : "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            mode: "cors",
            redirect: "error",
            body: JSON.stringify({
                "loan-amount": 100000,
                email: "ron@jon.com",
                model: getModelName(window.location.pathname),
                name: "Namington Namer",
                address: "12345 Senses Working Overtime",
                city: "There",
                zipcode: "12345",
                state: "NC",
                phone: "1234567890",
                "credit-score": "780", //string
                "household-income": 100000, //int
                "monthly-payment": 1457, //int
                "down-payment": 0.1, //decimal
                "interest-rate": 0.04, //decimal
                term: 30, //int
                dob: "10/22/1980", //string
                debt: 150000 //int
            })
        })
        const responseJson = await response.json()
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("Continue").addEventListener("click", submitCalc)
}, false);