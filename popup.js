document.getElementById('injectButton').addEventListener('click', () => {
    // Injecter du JS dans la page active
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: injectScript
        });
    });
});

// Le code JS à injecter
function injectScript() {
    const container = document.getElementsByClassName('mb-lg')[6];
    const div1 = document.getElementsByClassName('styles_adCard__JzKik')[0];
    const div2 = document.getElementsByClassName('styles_adCard__JzKik')[1];

    // Save the parent node and reference to the divs
    const parent = container;

    // Swap the positions
    parent.insertBefore(div2, div1);
    parent.insertBefore(div1, div2.nextSibling);

}
