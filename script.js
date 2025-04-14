const prompt = document.getElementById("prompt");
const submitbtn = document.getElementById("submitbtn");
const imagebtn = document.getElementById("imagebtn");
const imageinput = document.getElementById("imageinput");
const chatContainer = document.getElementById("chatContainer");
const image = document.querySelector("#imagebtn img");

const Api_Url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDLqgMM0yDjuOEGhz--Y7rNAWNVbUsslfU"

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

function createChatBox(html, classes) {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage;

    const userHtml = `
        <img src="user_icon.png" alt="User Avatar" class="avatar" />
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
        </div>
    `;

    prompt.value = "";
    const userChatbox = createChatBox(userHtml, "user-chat-box");
    chatContainer.appendChild(userChatbox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        const aiHtml = `
            <img src="ai_icon.png" alt="AI Avatar" class="avatar" />
            <div class="ai-chat-area">
                <img src="lodingimage.gif" alt="Loading..." width="30px" />
            </div>
        `;
        const aiChatBox = createChatBox(aiHtml, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 300);
}

async function generateResponse(aiChatBox) {
    const text = aiChatBox.querySelector(".ai-chat-area");

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: user.message },
                    ...(user.file.data ? [{ inline_data: user.file }] : [])
                ]
            }
        ]
    };

    try {
        const response = await fetch(Api_Url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        const apiResponse = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .trim();

        text.innerHTML = apiResponse;
    } catch (error) {
        console.error("Error:", error);
        text.innerHTML = "<span style='color: red;'>Failed to get response.</span>";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = `img.svg`;
        user.file = {};
    }
}

prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && prompt.value.trim()) {
        handlechatResponse(prompt.value.trim());
    }
});

submitbtn.addEventListener("click", () => {
    if (prompt.value.trim()) {
        handlechatResponse(prompt.value.trim());
    }
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
    };

    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imageinput.click();
});