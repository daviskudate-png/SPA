
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");

const results = document.getElementById("results");
const wordElement = document.getElementById("word");
const phoneticElement = document.getElementById("phonetic");
const definitionElement = document.getElementById("definition");
const synonymsElement = document.getElementById("synonyms");
const audio = document.getElementById("audio");
const audioButton = document.getElementById("audio-button");
const status = document.getElementById("status");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const word = input.value.trim();

    if (!word) {
        status.textContent = "Please enter a word.";
        return;
    }

    status.textContent = "Searching...";
    results.hidden = true;
    audioButton.hidden = true;
    audio.removeAttribute("src");

    try {
        const response = await fetch(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
);

        if (!response.ok) {
            throw new Error("Word not found");
        }

        const data = await response.json();
        const entry = data[0];

        wordElement.textContent = entry.word;
        const phonetic = entry.phonetic ||
            entry.phonetics.find(item => item.text)?.text ||
            "Pronunciation unavailable";

        phoneticElement.textContent = phonetic;
        const meanings = entry.meanings || [];

        const firstDefinition = meanings.find(
            meaning => meaning.definitions?.length > 0
        );

        definitionElement.textContent = firstDefinition
            ? firstDefinition.definitions[0].definition
            : "No definition available";
        const allSynonyms = meanings.flatMap(meaning => [
            ...(meaning.synonyms || []),
            ...(meaning.definitions|| []).flatMap(
                definition => definition.synonyms || []
            )
        ]);
        const uniqueSynonyms = [...new Set(allSynonyms)];

        synonymsElement.replaceChildren();

        if (uniqueSynonyms.length > 0) {
            uniqueSynonyms.slice(0, 10).forEach(synonym => {
                const listItem = document.createElement("li");
                listItem.textContent = synonym;
                synonymsElement.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement("li");
            listItem.textContent = "No synonyms available";
            synonymsElement.appendChild(listItem);
        }
        const audioInfo = entry.phonetics.find(item => item.audio);

        if (audioInfo) {
            audio.src = audioInfo.audio;
            audioButton.hidden = false;
        }
        results.hidden = false;
        status.textContent = "";
    } catch (error) {
        results.hidden = true;
        status.textContent =
            "Word not found. Please check your spelling and try again.";
    }
});
audioButton.addEventListener("click", function () {
    audio.play().catch(() => {
        status.textContent = "Unable to play pronunciation.";
    });
});
