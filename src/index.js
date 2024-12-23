const btn = document.getElementById('btn')
const fSelector = document.getElementById('fileSelector')
const filePathElement = document.getElementById('filePath')
const outputBox = document.getElementById('output')

var filePath;
var fileName = '';

btn.addEventListener('click', async () => {
  filePath = await window.electronAPI.openFile()
  fileName = filePath.replace(/^.*[\\\/]/, '');
  filePathElement.innerText = fileName
})

document.querySelector('#selectBtn').addEventListener('click', function (event) {
    asyncInstall();
});

async function asyncInstall (){
    await window.electronAPI.install(filePath);
}

document.querySelector('#connectBtn').addEventListener('click', function (event) {
    asyncConnect();
});

async function asyncConnect (){
    await window.electronAPI.connect();
}

window.electronAPI.onUpdateOutput((output) => {
    outputBox.innerText = output;
})

window.electronAPI.onConnect(() => {
    document.querySelector('#selectBtn').style.display = 'block';
    fSelector.style.display = 'flex';
})