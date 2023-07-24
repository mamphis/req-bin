// import type { HandledRequest } from '../../src/lib/requestListener'
const $ = document.querySelector.bind(document);

const $requestUrl = $('input#request-url') as HTMLInputElement;
const $copyUrl = $('button#copy-url') as HTMLButtonElement;
const $newBin = $('button#new-bin') as HTMLButtonElement;
const $clearBin = $('button#clear-bin') as HTMLButtonElement;
const $refreshBin = $('button#refresh-bin') as HTMLButtonElement;
const $reqBinStatus = $('a#req-bin-status') as HTMLAnchorElement;
const $requestList = $('div#request-list') as HTMLDivElement;
const $binDeleteAt = $('span#bin-delete-at') as HTMLSpanElement;
const $themeToggleDark = $('button#theme-toggle-dark') as HTMLButtonElement;
const $themeToggleLight = $('button#theme-toggle-light') as HTMLButtonElement;
const $html = $('html') as HTMLHtmlElement;

const $requestBaseData = $('div#base-data') as HTMLDivElement;
const $requestHeaders = $('tbody#headers') as HTMLTableElement;
const $requestBody = $('pre#body') as HTMLPreElement;

$requestUrl.value = location.href + '/bin';
$copyUrl.onclick = () => {
    navigator.clipboard.writeText($requestUrl.value);
};
$newBin.onclick = () => {
    window.location.replace(window.location.origin);
};
$clearBin.onclick = () => {
    fetch(window.location.href, {
        method: 'DELETE',
    });
    $requestList.innerHTML = '';
};
$refreshBin.onclick = () => {
    fetch(window.location.href + '/refresh', {
        method: 'POST',
    });
};

const eventSource = new EventSource(location.href + '/event');

const showDetails = (req: HTMLDivElement, data: any) => {
    document.querySelectorAll('div.request-list .selected').forEach(elem => elem.classList.remove('selected'));

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

    req.classList.add('selected');
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
    $req.classList.add('incoming-request', 'box', 'p-2', 'is-flex-grow-1');
    $timestamp.classList.add('timestamp');
    $method.classList.add('method');
    $ip.classList.add('ip')

    $timestamp.textContent = data.timestamp.toLocaleString('de');
    $method.textContent = data.method
    $ip.textContent = data.ips.join(', ');

    $req.appendChild($timestamp);
    $req.appendChild($method);
    $req.appendChild($ip);

    $req.onclick = showDetails.bind(globalThis, $req, data);

    $requestList.prepend($req);
});

eventSource.addEventListener('error', (ev) => {
    if (ev.eventPhase === EventSource.CLOSED) {
        eventSource.close();

        $reqBinStatus.classList.remove("is-success");
        $reqBinStatus.classList.add("is-danger");
    }
});

const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
console.log(darkModePreference);

const toggleTheme = (dark: boolean) => {
    if (dark) {
        $themeToggleDark.classList.add('is-active', 'c-is-accent');
        $themeToggleLight.classList.remove('is-active', 'c-is-accent');
        $html.classList.add('dark');
    } else {
        $themeToggleLight.classList.add('is-active', 'c-is-accent');
        $themeToggleDark.classList.remove('is-active', 'c-is-accent');
        $html.classList.remove('dark');
    }
}

toggleTheme(darkModePreference.matches);
$themeToggleDark.onclick = toggleTheme.bind(window, true);
$themeToggleLight.onclick = toggleTheme.bind(window, false);
