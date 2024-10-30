import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

function isValidInput(data) {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const descriptionMinLength = 100;
    const descriptionMaxLength = 300;
    const wordCount = data.description.trim().split(/\s+/).length;

    // Check if URL is valid
    if (!urlRegex.test(data.url)) {
        console.log(data.url + "is not an valid url")
        return false;
    }

    // Check if description meets length requirement
    if (wordCount < 100 || wordCount > 300) {
        console.log(data.description.length + "is not between  :"+descriptionMinLength+" and "+ descriptionMaxLength)
        return false;
    }

    // Check if description contains forbidden words
    const forbiddenWords = ["<script>", "alert()", "SELECT", "DROP", "INSERT", "DELETE"];
    for (let word of forbiddenWords) {
        if (data.description.includes(word)) {
            console.log("considered as dangerous since it contains the word :"+word)
            return false;
        }
    }
    return true;
}

function sendToFirebase(data) {
    const firebaseConfig = {
        apiKey: "AIzaSyD0DYZHTxcC1UGAESN59FBFMb1N6CFX774",
        authDomain: "backlinks-75941.firebaseapp.com",
        projectId: "backlinks-75941",
        storageBucket: "backlinks-75941.appspot.com",
        messagingSenderId: "257933340257",
        appId: "1:257933340257:web:33a336a5f476edb72e4420",
        measurementId: "G-02Q5JRWHGK",
        databaseURL: "https://backlinks-75941-default-rtdb.europe-west1.firebasedatabase.app"
    };
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    push(ref(database, 'submissions'), {
        url: data.url,
        description: data.description.replace("\n", "</br>"),
        timestamp: Date.now() // Adding a timestamp for tracking
    })
    .then(() => {
        console.log('Data successfully submitted');
    })
    .catch(error => {
        console.error('Submission error:', error);
        console.log('Data submission error');
    });
}

function validateTextarea() {
    const description = document.getElementById("description-input").value;
    const wordCount = description.trim().split(/\s+/).length;
    const errorMessage = document.getElementById("error-message");
    console.log(wordCount);
    if (wordCount < 100 || wordCount > 300) {
        errorMessage.style.display = "block";
        return false;
    } else {
        errorMessage.style.display = "none";
        return true;
    }
}

function submitForm(event) {
    event.preventDefault(); // Prevent page reload

    if (validateTextarea()) {
        document.querySelector('form').style.display = 'none';
        const boldText = document.querySelector('#bold-text');
        boldText.textContent = "One last step!";

        if (!document.getElementById("step-button-container")) {
            const message = document.createElement('p');
            message.textContent = "Place this link : " + window.location.href  + " on the page you want to highlight. This step is optional but improves results!";
            message.style = "text-align: justify; margin-bottom: 10px; width: 75%;";

            const buttonBox = document.createElement('div');
            buttonBox.id = "step-button-container";

            const backBtn = document.createElement('button');
            backBtn.textContent = "Back";
            backBtn.id = "back-button";
            backBtn.className ="cta-button";
            backBtn.onclick = function() {
                document.querySelector('form').style.display = 'block';
                message.remove();
                buttonBox.remove();
            };

            const nextBtn = document.createElement('button');
            nextBtn.textContent = "Next";
            nextBtn.id = "next-button";
            nextBtn.className ="cta-button";
            nextBtn.onclick = function() {
                boldText.textContent = "Thank you, your link will be posted in less than 6 hours !";
                document.getElementById("link_list").style.display = "block";
                message.remove();
                buttonBox.remove();

                const formData = {
                    url: document.querySelector('input[type="url"]').value,
                    description: document.querySelector('textarea').value
                };

                if (!isValidInput(formData)) {
                    alert("An error occurred, please try again.");
                    window.location.reload();

                } else {
                    sendToFirebase(formData);
                }
            };

            buttonBox.appendChild(backBtn);
            buttonBox.appendChild(nextBtn);
            document.querySelector('.form-section').appendChild(message);
            document.querySelector('.form-section').appendChild(buttonBox);
        }
    }
}

// Attach event to form submission
window.onload = function() {
    document.querySelector('form').addEventListener('submit', submitForm);
};
