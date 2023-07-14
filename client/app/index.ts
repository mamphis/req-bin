// import type { HandledRequest } from '../../src/lib/requestListener'
const $ = document.querySelector.bind(document);

const $requestUrl = $('input#request-url') as HTMLInputElement;
const $copyUrl = $('button#copy-url') as HTMLButtonElement;
const $newBin = $('button#new-bin') as HTMLButtonElement;
const $clearBin = $('button#clear-bin') as HTMLButtonElement;
const $requestList = $('div.request-list') as HTMLDivElement;
const $binDeleteAt = $('span#bin-delete-at') as HTMLSpanElement;

const $requestBaseData = $('div#base-data') as HTMLDivElement;
const $requestHeaders = $('tbody#headers') as HTMLTableElement;
const $requestBody = $('pre#body') as HTMLPreElement;


$requestUrl.value = location.href + '/bin';
$copyUrl.onclick = () => {
    navigator.clipboard.writeText($requestUrl.value);
}
$newBin.onclick = () => {
    window.location.replace(window.location.origin);
}
$clearBin.onclick = () => {
    fetch(window.location.href, {
        method: 'DELETE',
    });
    $requestList.innerHTML = '';
}

const eventSource = new EventSource(location.href + '/event');

const showDetails = (data: any) => {
    const $timestamp = document.createElement('div');
    const $method = document.createElement('div');
    const $ip = document.createElement('div');

    $timestamp.textContent = data.timestamp.toLocaleString('de');
    $method.textContent = data.method
    $ip.textContent = data.ips.join(', ');

    $requestBaseData.replaceChildren($method, $timestamp, $ip);
    $requestHeaders.innerHTML = '';

    for (const key in data.headers) {
        if (Object.prototype.hasOwnProperty.call(data.headers, key)) {
            const value = data.headers[key];
            const $headerRow = document.createElement('tr');
            const $headerName = document.createElement('td');
            $headerName.textContent = key;

            const $headerValue = document.createElement('td');
            $headerValue.textContent = value;

            $headerRow.append($headerName, $headerValue);
            $requestHeaders.appendChild($headerRow);
        }
    }
    console.log(data);
    $requestBody.textContent = data.body;
}

eventSource.addEventListener('config', (ev) => {
    const config = JSON.parse(ev.data);
    $binDeleteAt.textContent = new Date(config.deleteAt).toLocaleString('de');
});

eventSource.addEventListener('request', (ev) => {
    const data = JSON.parse(ev.data);

    data.timestamp = new Date(data.timestamp);
    const $req = document.createElement('div');
    const $timestamp = document.createElement('div');
    const $method = document.createElement('div');
    const $ip = document.createElement('div');
    $req.classList.add('incoming-request');
    $timestamp.classList.add('timestamp');
    $method.classList.add('method');
    $ip.classList.add('ip')

    $timestamp.textContent = data.timestamp.toLocaleString('de');
    $method.textContent = data.method
    $ip.textContent = data.ips.join(', ');

    $req.appendChild($timestamp);
    $req.appendChild($method);
    $req.appendChild($ip);

    $req.onclick = showDetails.bind(globalThis, data);

    $requestList.prepend($req);
});
